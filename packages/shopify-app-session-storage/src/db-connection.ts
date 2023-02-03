/**
 * Define a common way for migrator to execute query on the underlying persistence layer
 */
export interface DBConnection {
  /** the table used to store sessions */
  sessionDBIdentifier: string;

  /**
   * Initiate the actual connection to the underlying database
   */
  connect(): Promise<void>;

  /**
   * Disconnect from the underlying database
   */
  disconnect(): Promise<void>;

  /**
   * Make a query to the underlying DB
   * @param query - the query to execute
   * @param params - the parameters required by the query
   */
  query(query: string, params: any[]): Promise<any[]>;
}

/**
 * This is for the use cases of the RDBMS database where
 */
export interface RdbmsConnection extends DBConnection {
  /**
   * use #hasTable method if 'true', or use "IF NOT EXISTS" if 'false' in CREATE TABLE statements
   * to determine if a given needs to be created or not
   */
  useHasTable: boolean;

  /**
   * Depending on which DB engine the place holder for parameter in sql query can be either '?' or '$' and a number
   * (or anything else for that matter)
   */
  sqlArgumentPlaceholder: string;

  /**
   * Determine if a table exist
   * @param tablename - the table to search
   */
  hasTable(tablename: string): Promise<boolean>;

  /**
   * Based on the the #sqlArgumentPlaceholder value and the underlying engine, return the place holder for a given position in a list of sql argument
   * @param position the position of the given sql argument
   */
  getArgumentPlaceholder(position: number): string;
}
