// import type {PrismaClient} from '@prisma/client';
import {Session, SessionParams} from '@shopify/shopify-api';
import {SessionStorage} from '@shopify/shopify-app-session-storage';
import type {PrismaClient, Session as Row} from '@prisma/client';

export class PrismaSessionStorage implements SessionStorage {
  constructor(
    private prisma: PrismaClient | (PrismaClient & {[key: string]: unknown}),
  ) {
    if (this.prisma.session === undefined) {
      throw new Error('PrismaClient does not have a Session table');
    }
  }

  public async storeSession(session: Session): Promise<boolean> {
    const data = this.sessionToRow(session);

    await this.prisma.session.upsert({
      where: {id: session.id},
      update: data,
      create: data,
    });

    return true;
  }

  public async loadSession(id: string): Promise<Session | undefined> {
    const row = await this.prisma.session.findUnique({
      where: {id},
    });

    if (!row) {
      return undefined;
    }

    return this.rowToSession(row);
  }

  public async deleteSession(id: string): Promise<boolean> {
    try {
      await this.prisma.session.delete({where: {id}});
    } catch {
      return true;
    }

    return true;
  }

  public async deleteSessions(ids: string[]): Promise<boolean> {
    await this.prisma.session.deleteMany({where: {id: {in: ids}}});

    return true;
  }

  public async findSessionsByShop(shop: string): Promise<Session[]> {
    const sessions = await this.prisma.session.findMany({
      where: {shop},
      take: 25,
      orderBy: [{expires: 'desc'}],
    });

    return sessions.map((session) => this.rowToSession(session));
  }

  private sessionToRow(session: Session): Row {
    const sessionParams = session.toObject();

    return {
      ...sessionParams,
      scope: session.scope || null,
      expires: session.expires ? session.expires : null,
      accessToken: session.accessToken || '',
      onlineAccessInfo: sessionParams.onlineAccessInfo
        ? JSON.stringify(sessionParams.onlineAccessInfo)
        : null,
    };
  }

  private rowToSession(row: Row): Session {
    const sessionParams: SessionParams = {
      id: row.id,
      shop: row.shop,
      state: row.state,
      isOnline: row.isOnline,
      expires: row.expires ? row.expires : undefined,
    };

    if (row.scope) {
      sessionParams.scope = row.scope;
    }

    if (row.accessToken) {
      sessionParams.accessToken = row.accessToken;
    }

    if (row.onlineAccessInfo) {
      sessionParams.onlineAccessInfo = JSON.parse(row.onlineAccessInfo);
    }

    return new Session(sessionParams);
  }
}
