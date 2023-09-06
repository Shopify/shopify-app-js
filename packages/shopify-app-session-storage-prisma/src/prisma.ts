import {Session} from '@shopify/shopify-api';
import {SessionStorage} from '@shopify/shopify-app-session-storage';
import type {PrismaClient, Session as Row} from '@prisma/client';

interface PrismaSessionStorageOptions {
  tableName?: string;
}

export class PrismaSessionStorage<T extends PrismaClient>
  implements SessionStorage
{
  private ready: Promise<any>;
  private readonly tableName: string = 'session';

  constructor(
    private prisma: T,
    {tableName}: PrismaSessionStorageOptions = {},
  ) {
    if (tableName) {
      this.tableName = tableName;
    }

    if (this.getSessionTable() === undefined) {
      throw new Error(`PrismaClient does not have a ${this.tableName} table`);
    }
    this.ready = this.getSessionTable()
      .count()
      .catch(() => {
        throw new MissingSessionTableError(
          `Prisma ${this.tableName} table does not exist. This could happen for a few reasons, see https://github.com/Shopify/shopify-app-js/tree/main/packages/shopify-app-session-storage-prisma#troubleshooting for more information`,
        );
      });
  }

  public async storeSession(session: Session): Promise<boolean> {
    await this.ready;

    const data = this.sessionToRow(session);

    await this.getSessionTable().upsert({
      where: {id: session.id},
      update: data,
      create: data,
    });

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

    return sessions.map((session) => this.rowToSession(session));
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
    };
  }

  private rowToSession(row: Row): Session {
    const sessionParams: {[key: string]: boolean | string | number} = {
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

    return Session.fromPropertyArray(Object.entries(sessionParams));
  }

  private getSessionTable(): T['session'] {
    return (this.prisma as any)[this.tableName];
  }
}

export class MissingSessionTableError extends Error {}
