import {Session} from '@shopify/shopify-api';
import {and, eq} from 'drizzle-orm';
import type {SessionStorage} from '@shopify/shopify-app-session-storage';

import * as schema from './drizzle/schema';

export class DrizzleSessionStorage implements SessionStorage {
  constructor(
    // Generated Types needed from the following (in user app)
    // export const db = drizzle(client, { schema });
    private db: any,
    private sessionsTable: typeof schema.sessions,
  ) {
    this.db = db;
    this.sessionsTable = sessionsTable;
  }

  // Fix Date type
  public async storeSession(session: Session): Promise<boolean> {
    await this.db.insert(this.sessionsTable).values(session);

    // Need to fix "session" to be the expected shape
    // onConflictDoUpdate({ where : sql`${sessions.id} = ${session.id}`, set: session })

    return true;
  }

  public async loadSession(id: string): Promise<Session | undefined> {
    const row = await this.db.query.sessions.findFirst({
      where(fields: any, operators: any) {
        return operators.eq(fields.id, id);
      },
    });

    if (!row) {
      return undefined;
    }

    return this.databaseRowToSession(row);
  }

  public async deleteSession(id: string): Promise<boolean> {
    // Actually check it deleted
    await this.db
      .delete(this.sessionsTable)
      .where(eq(this.sessionsTable.id, id));

    return true;
  }

  public async deleteSessions(ids: string[]): Promise<boolean> {
    if (ids.length === 0) return true;

    await this.db
      .delete(this.sessionsTable)
      .where(and(...ids.map((id) => eq(this.sessionsTable.id, id))));

    return true;
  }

  public async findSessionsByShop(shop: string): Promise<Session[]> {
    const sessions = await this.db.query.sessions.findMany({
      where: (fields: any, operators: any) => {
        return operators.eq(fields.shop, shop);
      },
      limit: 25,
      orderBy(fields: any, operators: any) {
        return operators.desc(fields.expires);
      },
    });

    // Transform rows to sessions
    return sessions.map((row: any) => this.databaseRowToSession(row));
  }

  // "row" could be a LibSQL Row
  private databaseRowToSession(row: any): Session {
    if (row.expires) row.expires = row.expires.getTime();

    return Session.fromPropertyArray(Object.entries(row));
  }
}
