export interface ScopesApiContext {
  query: () => Promise<ScopesDetail>;
  request: (scopes: string[]) => Promise<void>;
  revoke: (scopes: string[]) => Promise<RevokeResponse>;
}

export interface RevokeResponse {
  revoked: string[];
}
export interface ScopesDetail {
  granted: string[];
  required: string[];
  optional: string[];
}
