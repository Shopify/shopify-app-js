import {Session} from '@shopify/shopify-api';

import {SessionStorageMigratorOptions} from './session-storage-migration';

/**
 * Defines the strategy to be used to store sessions for the Shopify App.
 */
interface SessionStorage {
  /**
   * Creates or updates the given session in storage.
   *
   * @param session Session to store
   */
  storeSession(session: Session): Promise<boolean>;

  /**
   * Loads a session from storage.
   *
   * @param id Id of the session to load
   */
  loadSession(id: string): Promise<Session | undefined>;

  /**
   * Deletes a session from storage.
   *
   * @param id Id of the session to delete
   */
  deleteSession(id: string): Promise<boolean>;

  /**
   * Deletes an array of sessions from storage.
   *
   * @param ids Array of session id's to delete
   */
  deleteSessions(ids: string[]): Promise<boolean>;

  /**
   * Return an array of sessions for a given shop (or [] if none found).
   *
   * @param shop shop of the session(s) to return
   */
  findSessionsByShop(shop: string): Promise<Session[]>;
}

interface RdbmsSessionStorageOptions {
  sessionTableName: string;
  sqlArgumentPlaceholder: string;
  migratorOptions: SessionStorageMigratorOptions | null;
}

export {SessionStorage, RdbmsSessionStorageOptions};
