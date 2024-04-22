import {OnErrorOptions} from '../authenticate/admin/strategies/types';

export interface OptionalScopesOptions {
  errorHandling: 'automatic' | 'none';
  redirection: 'inline' | 'modal';
}

export interface OptionalScopes {
  onMissingScope?: (options: OnErrorOptions) => void;
  onErrorBoundary?: (error: any) => void;
  config: OptionalScopesOptions;
}

export interface MissingScopesResponse {
  type: 'missingScopes';
  data: {
    scopes: string[];
  };
}
