export interface ScopesApiContext {
  get: (forceRemote?: boolean) => Promise<string[]>;
  check: (scopes: string[], forceRemote?: boolean) => Promise<string[]>;
  revoke: (scopes: string[]) => Promise<boolean>;
  request: (scopes: string[], forceRemote?: boolean) => Promise<void>;
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

export interface GetAppId {
  app: {
    id: string;
  };
}
