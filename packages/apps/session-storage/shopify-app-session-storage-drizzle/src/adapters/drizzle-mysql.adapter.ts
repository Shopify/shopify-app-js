import {Session} from '@shopify/shopify-api';
import {SessionStorage} from '@shopify/shopify-app-session-storage';
import {
  InferInsertModel,
  InferSelectModel,
  desc,
  eq,
  inArray,
} from 'drizzle-orm';
import {
  MySqlDatabase,
  PreparedQueryHKTBase,
  MySqlQueryResultHKT,
} from 'drizzle-orm/mysql-core';

import {MySQLSessionTable} from '../schemas/mysql.schema';

export class DrizzleSessionStorageMySQL implements SessionStorage {
  constructor(
    private readonly db: MySqlDatabase<
      MySqlQueryResultHKT,
      PreparedQueryHKTBase,
      any
    >,
    private readonly sessionTable: MySQLSessionTable,
  ) {}

  public async storeSession(session: Session): Promise<boolean> {
    const row = this.sessionToRow(session);

    await this.db
      .insert(this.sessionTable)
      .values({...row})
      .onDuplicateKeyUpdate({
        set: {...row},
      });

    return true;
  }

  public async loadSession(id: string): Promise<Session | undefined> {
    try {
      const row = await this.db
        .select()
        .from(this.sessionTable)
        .where(eq(this.sessionTable.id, id));

      if (!row[0]) {
        return undefined;
      }

      return this.rowToSession(row[0]);
    } catch (error) {
      console.error(error);

      return undefined;
    }
  }

  public async deleteSession(id: string): Promise<boolean> {
    try {
      await this.db
        .delete(this.sessionTable)
        .where(eq(this.sessionTable.id, id));
    } catch (error) {
      console.error(error);

      return false;
    }

    return true;
  }

  public async deleteSessions(ids: string[]): Promise<boolean> {
    try {
      await this.db
        .delete(this.sessionTable)
        .where(inArray(this.sessionTable.id, ids));

      return true;
    } catch (error) {
      console.error(error);

      return false;
    }
  }

  public async findSessionsByShop(shop: string): Promise<Session[]> {
    const sessions = await this.db
      .select()
      .from(this.sessionTable)
      .where(eq(this.sessionTable.shop, shop))
      .orderBy(desc(this.sessionTable.expires));

    return sessions.map((session) => this.rowToSession(session));
  }

  private sessionToRow(session: Session): InferInsertModel<MySQLSessionTable> {
    const sessionParams = session.toObject();

    return {
      id: session.id,
      shop: session.shop,
      state: session.state,
      isOnline: session.isOnline,
      scope: session.scope || null,
      expires: session.expires || null,
      accessToken: session.accessToken || '',
      userId: sessionParams.onlineAccessInfo?.associated_user.id || null,
      firstName:
        sessionParams.onlineAccessInfo?.associated_user.first_name || null,
      lastName: sessionParams.onlineAccessInfo?.associated_user.last_name || null,
      email: sessionParams.onlineAccessInfo?.associated_user.email || null,
      accountOwner:
        sessionParams.onlineAccessInfo?.associated_user.account_owner || false,
      locale: sessionParams.onlineAccessInfo?.associated_user.locale || null,
      collaborator:
        sessionParams.onlineAccessInfo?.associated_user.collaborator || false,
      emailVerified:
        sessionParams.onlineAccessInfo?.associated_user.email_verified || false,
      refreshToken: sessionParams.refreshToken || null,
      refreshTokenExpires: sessionParams.refreshTokenExpires || null,
    };
  }

  private rowToSession(row: InferSelectModel<MySQLSessionTable>): Session {
    const sessionParams: Record<string, boolean | string | number> = {
      id: row.id,
      shop: row.shop,
      state: row.state,
      isOnline: row.isOnline,
    };

    if (row.userId !== null && row.userId !== undefined) {
      sessionParams.userId = String(row.userId);
    }

    if (row.firstName !== null && row.firstName !== undefined) {
      sessionParams.firstName = String(row.firstName);
    }

    if (row.lastName !== null && row.lastName !== undefined) {
      sessionParams.lastName = String(row.lastName);
    }

    if (row.email !== null && row.email !== undefined) {
      sessionParams.email = String(row.email);
    }

    if (row.locale !== null && row.locale !== undefined) {
      sessionParams.locale = String(row.locale);
    }

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

    if (row.refreshToken) {
      sessionParams.refreshToken = row.refreshToken;
    }

    if (row.refreshTokenExpires) {
      sessionParams.refreshTokenExpires = row.refreshTokenExpires.getTime();
    }

    return Session.fromPropertyArray(Object.entries(sessionParams), true);
  }
}
