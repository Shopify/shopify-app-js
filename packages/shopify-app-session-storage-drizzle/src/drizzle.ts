import {Session} from '@shopify/shopify-api';
import type {SessionStorage} from '@shopify/shopify-app-session-storage';
import {and, eq} from 'drizzle-orm';

export interface DrizzleSessionStorageOptions {
  // If not `sessions` then pass something else?
  table?: any;
}

export class DrizzleSessionStorage implements SessionStorage {
  // Generated Types needed from Drizzle
  constructor(
    private db: any,
    // Required currently
    private sessions: any,
    options: Partial<DrizzleSessionStorageOptions> = {},
  ) {
    this.db = db;
    this.sessions = sessions;
    console.log(options);
  }

  // Fix Date type
  public async storeSession(session: Session): Promise<boolean> {
    await this.db.insert(this.sessions).values(session);

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
    await this.db.delete(this.sessions).where(eq(this.sessions.id, id));

    return true;
  }

  public async deleteSessions(ids: string[]): Promise<boolean> {
    if (ids.length === 0) return true;

    await this.db
      .delete(this.sessions)
      .where(and(...ids.map((id) => eq(this.sessions.id, id))));

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
