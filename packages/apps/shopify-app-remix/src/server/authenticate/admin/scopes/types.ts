export interface ScopesApiContext {
  get: (forceRemote?: boolean) => Promise<string[]>;
  check: (scopes: string[], forceRemote?: boolean) => Promise<boolean>;
}

export interface GetResponse {
  app: {
    id: string;
    requestedAccessScopes: {
      handle: string;
    }[];
    optionalAccessScopes: {
      handle: string;
    }[];
    installation: {
      accessScopes: {
        handle: string;
      }[];
    };
  };
}
