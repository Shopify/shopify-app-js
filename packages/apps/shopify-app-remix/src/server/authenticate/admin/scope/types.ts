export interface ScopesApiContext {
  request: (scopes: string[]) => Promise<void>;
}
