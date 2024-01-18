import {Session} from '@shopify/shopify-api';
import {and, eq} from 'drizzle-orm';
import type {SessionStorage} from '@shopify/shopify-app-session-storage';

export class DrizzleSessionStorage implements SessionStorage {
  constructor(
    // Generated Types needed from the following (in user app)
    // export const db = drizzle(client, { schema });
    // sessionsTable could be sqliteTable, pgTable etc.
    private db: any,
    private sessionsTable: any,
  ) {
    this.db = db;
    this.sessionsTable = sessionsTable;
  }

  public async storeSession(session: Session): Promise<boolean> {
    await this.db
      .insert(this.sessionsTable)
      .values(session)
      .onConflictDoUpdate({
        target: this.sessionsTable.id,
        set: session,
      });

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
    const deletedSessionIds: {deletedId: string}[] = await this.db
      .delete(this.sessionsTable)
      .where(eq(this.sessionsTable.id, id))
      .returning({deletedId: this.sessionsTable.id});

    return deletedSessionIds.length > 0;
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

    return sessions.map((row: any) => this.databaseRowToSession(row));
  }

  private databaseRowToSession(row: any): Session {
    if (row.expires) row.expires = new Date(row.expires);

    return Session.fromPropertyArray(Object.entries(row));
  }
}
