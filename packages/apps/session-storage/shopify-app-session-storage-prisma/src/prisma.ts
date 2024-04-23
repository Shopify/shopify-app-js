import {Session, SessionParams} from '@shopify/shopify-api';
import {SessionStorage} from '@shopify/shopify-app-session-storage';
import type {PrismaClient, Session as Row} from '@prisma/client';
import {Prisma} from '@prisma/client';

interface PrismaSessionStorageOptions {
  encryptionKey?: CryptoKey;
  tableName?: string;
}

const UNIQUE_KEY_CONSTRAINT_ERROR_CODE = 'P2002';

export class PrismaSessionStorage<T extends PrismaClient>
  implements SessionStorage
{
  private ready: Promise<any>;
  private readonly tableName: string = 'session';
  private readonly encryptionKey: CryptoKey | undefined;

  constructor(
    private prisma: T,
    {tableName, encryptionKey}: PrismaSessionStorageOptions = {},
  ) {
    if (tableName) {
      this.tableName = tableName;
    }

    if (encryptionKey) {
      this.encryptionKey = encryptionKey;
    }

    if (this.getSessionTable() === undefined) {
      throw new Error(`PrismaClient does not have a ${this.tableName} table`);
    }
    this.ready = this.getSessionTable()
      .count()
      .catch((cause) => {
        throw new MissingSessionTableError(
          `Prisma ${this.tableName} table does not exist. This could happen for a few reasons, see https://github.com/Shopify/shopify-app-js/tree/main/packages/apps/session-storage/shopify-app-session-storage-prisma#troubleshooting for more information`,
          cause,
        );
      });
  }

  public async storeSession(session: Session): Promise<boolean> {
    await this.ready;

    const data = await this.sessionToRow(session);

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
    await this.ready;

    const row = await this.getSessionTable().findUnique({
      where: {id},
    });

    if (!row) {
      return undefined;
    }

    return this.rowToSession(row);
  }

  public async deleteSession(id: string): Promise<boolean> {
    await this.ready;

    try {
      await this.getSessionTable().delete({where: {id}});
    } catch {
      return true;
    }

    return true;
  }

  public async deleteSessions(ids: string[]): Promise<boolean> {
    await this.ready;

    await this.getSessionTable().deleteMany({where: {id: {in: ids}}});

    return true;
  }

  public async findSessionsByShop(shop: string): Promise<Session[]> {
    await this.ready;

    const sessions = await this.getSessionTable().findMany({
      where: {shop},
      take: 25,
      orderBy: [{expires: 'desc'}],
    });

    const sessionObjects: Session[] = [];
    for (const session of sessions) {
      sessionObjects.push(await this.rowToSession(session));
    }

    return sessionObjects;
  }

  private async sessionToRow(session: Session): Promise<Row> {
    let sessionParams: SessionParams;
    if (this.encryptionKey) {
      sessionParams = Object.fromEntries(
        await session.toEncryptedPropertyArray(this.encryptionKey),
      ) as SessionParams;
    } else {
      sessionParams = Object.fromEntries(
        session.toPropertyArray(),
      ) as SessionParams;
    }

    return {
      id: sessionParams.id,
      shop: sessionParams.shop,
      state: sessionParams.state,
      isOnline: sessionParams.isOnline,
      scope: sessionParams.scope || null,
      expires: sessionParams.expires ? new Date(sessionParams.expires) : null,
      accessToken: sessionParams.accessToken || '',
      userId: (sessionParams.onlineAccessInfo as unknown as bigint) || null,
    };
  }

  private async rowToSession(row: Row): Promise<Session> {
    const sessionParams: Record<string, boolean | string | number> = {
      id: row.id,
      shop: row.shop,
      state: row.state,
      isOnline: row.isOnline,
    };

    if (row.expires) {
      sessionParams.expires = row.expires.getTime();
    }

    if (row.scope) {
      sessionParams.scope = row.scope;
    }

    if (row.accessToken) {
      sessionParams.accessToken = row.accessToken;
    }

    if (row.userId) {
      sessionParams.onlineAccessInfo = String(row.userId);
    }

    if (this.encryptionKey) {
      return Session.fromEncryptedPropertyArray(
        Object.entries(sessionParams),
        this.encryptionKey,
      );
    } else {
      return Session.fromPropertyArray(Object.entries(sessionParams));
    }
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
