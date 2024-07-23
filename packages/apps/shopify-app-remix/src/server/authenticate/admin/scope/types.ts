export interface ScopesApiContext {
  query: () => Promise<ScopesInformation>;
  request: (scopes: string[]) => Promise<void>;
  revoke: (scopes: string[]) => Promise<ScopesInformation>;
}

export interface ScopesInformation {
  granted: GrantedScopes;
  declared: DeclaredScopes;
}

export interface DeclaredScopes {
  required: string[];
}

export interface GrantedScopes {
  required: string[];
  optional: string[];
}
