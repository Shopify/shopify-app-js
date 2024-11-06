import {Session} from '@shopify/shopify-api';
import {SessionStorage} from '@shopify/shopify-app-session-storage';
import type {PrismaClient, Session as Row} from '@prisma/client';
import {Prisma} from '@prisma/client';

interface PrismaSessionStorageOptions {
  tableName?: string;
  connectionRetries?: number;
  connectionRetryIntervalMs?: number;
}

const UNIQUE_KEY_CONSTRAINT_ERROR_CODE = 'P2002';

// eslint-disable-next-line no-warning-comments
// TODO: Remove this when all session storages have implemented the isReady method
export interface PrismaSessionStorageInterface extends SessionStorage {
  isReady(): Promise<boolean>;
}

export class PrismaSessionStorage<T extends PrismaClient>
  implements PrismaSessionStorageInterface
{
  private ready: Promise<boolean>;
  private readonly tableName: string = 'session';
  private connectionRetries = 2;
  private connectionRetryIntervalMs = 5000;

  constructor(
    private prisma: T,
    {
      tableName,
      connectionRetries,
      connectionRetryIntervalMs,
    }: PrismaSessionStorageOptions = {},
  ) {
    if (tableName) {
      this.tableName = tableName;
    }

    if (connectionRetries !== undefined) {
      this.connectionRetries = connectionRetries;
    }

    if (connectionRetryIntervalMs !== undefined) {
      this.connectionRetryIntervalMs = connectionRetryIntervalMs;
    }

    if (this.getSessionTable() === undefined) {
      throw new Error(`PrismaClient does not have a ${this.tableName} table`);
    }

    this.ready = this.pollForTable()
      .then(() => true)
      .catch((cause) => {
        throw new MissingSessionTableError(
          `Prisma ${this.tableName} table does not exist. This could happen for a few reasons, see https://github.com/Shopify/shopify-app-js/tree/main/packages/apps/session-storage/shopify-app-session-storage-prisma#troubleshooting for more information`,
          cause,
        );
      });
  }

  public async storeSession(session: Session): Promise<boolean> {
    await this.ensureReady();
    const data = this.sessionToRow(session);

    try {
      await this.getSessionTable().upsert({
        where: {id: session.id},
        update: data,
        create: data,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === UNIQUE_KEY_CONSTRAINT_ERROR_CODE
      ) {
        console.log(
          'Caught PrismaClientKnownRequestError P2002 - Unique Key Key Constraint, retrying upsert.',
        );
        await this.getSessionTable().upsert({
          where: {id: session.id},
          update: data,
          create: data,
        });
        return true;
      }
      throw error;
    }

    return true;
  }

  public async loadSession(id: string): Promise<Session | undefined> {
    await this.ensureReady();
    const row = await this.getSessionTable().findUnique({
      where: {id},
    });

    if (!row) {
      return undefined;
    }

    return this.rowToSession(row);
  }

  public async deleteSession(id: string): Promise<boolean> {
    await this.ensureReady();
    try {
      await this.getSessionTable().delete({where: {id}});
    } catch {
      return true;
    }

    return true;
  }

  public async deleteSessions(ids: string[]): Promise<boolean> {
    await this.ensureReady();
    await this.getSessionTable().deleteMany({where: {id: {in: ids}}});

    return true;
  }

  public async findSessionsByShop(shop: string): Promise<Session[]> {
    await this.ensureReady();
    const sessions = await this.getSessionTable().findMany({
      where: {shop},
      take: 25,
      orderBy: [{expires: 'desc'}],
    });

    return sessions.map((session) => this.rowToSession(session));
  }

  public async isReady(): Promise<boolean> {
    try {
      await this.pollForTable();
      this.ready = Promise.resolve(true);
    } catch (_error) {
      this.ready = Promise.resolve(false);
    }
    return this.ready;
  }

  private async ensureReady(): Promise<void> {
    if (!(await this.ready))
      throw new MissingSessionStorageError(
        'Prisma session storage is not ready. Use the `isReady` method to poll for the table.',
      );
  }

  private async pollForTable(): Promise<void> {
    for (let i = 0; i < this.connectionRetries; i++) {
      try {
        await this.getSessionTable().count();
        return;
      } catch (error) {
        console.log(`Error obtaining session table: ${error}`);
      }
      await sleep(this.connectionRetryIntervalMs);
    }
    throw Error(
      `The table \`${this.tableName}\` does not exist in the current database.`,
    );
  }

  private sessionToRow(session: Session): Row {
    const sessionParams = session.toObject();

    return {
      id: session.id,
      shop: session.shop,
      state: session.state,
      isOnline: session.isOnline,
      scope: session.scope || null,
      expires: session.expires || null,
      accessToken: session.accessToken || '',
      userId:
        (sessionParams.onlineAccessInfo?.associated_user
          .id as unknown as bigint) || null,
      firstName:
        sessionParams.onlineAccessInfo?.associated_user.first_name || null,
      lastName:
        sessionParams.onlineAccessInfo?.associated_user.last_name || null,
      email: sessionParams.onlineAccessInfo?.associated_user.email || null,
      accountOwner:
        sessionParams.onlineAccessInfo?.associated_user.account_owner || false,
      locale: sessionParams.onlineAccessInfo?.associated_user.locale || null,
      collaborator:
        sessionParams.onlineAccessInfo?.associated_user.collaborator || false,
      emailVerified:
        sessionParams.onlineAccessInfo?.associated_user.email_verified || false,
    };
  }

  private rowToSession(row: Row): Session {
    const sessionParams: Record<string, boolean | string | number> = {
      id: row.id,
      shop: row.shop,
      state: row.state,
      isOnline: row.isOnline,
      userId: String(row.userId),
      firstName: String(row.firstName),
      lastName: String(row.lastName),
      email: String(row.email),
      locale: String(row.locale),
    };

    if (row.accountOwner !== null) {
      sessionParams.accountOwner = row.accountOwner;
    }

    if (row.collaborator !== null) {
      sessionParams.collaborator = row.collaborator;
    }

    if (row.emailVerified !== null) {
      sessionParams.emailVerified = row.emailVerified;
    }

    if (row.expires) {
      sessionParams.expires = row.expires.getTime();
    }

    if (row.scope) {
      sessionParams.scope = row.scope;
    }

    if (row.accessToken) {
      sessionParams.accessToken = row.accessToken;
    }

    return Session.fromPropertyArray(Object.entries(sessionParams), true);
  }

  private getSessionTable(): T['session'] {
    return (this.prisma as any)[this.tableName];
  }
}

export class MissingSessionTableError extends Error {
  constructor(
    message: string,
    public readonly cause: Error,
  ) {
    super(message);
  }
}

export class MissingSessionStorageError extends Error {
  constructor(message: string) {
    super(message);
  }
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
