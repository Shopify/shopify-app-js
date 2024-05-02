import {JwtPayload} from '@shopify/shopify-api';

import {EnsureCORSFunction} from '../../helpers';

export type AuthenticateExtension<
  Context extends ExtensionContext,
  Options extends AuthenticateExtensionOptions = AuthenticateExtensionOptions,
> = (request: Request, options?: Options) => Promise<Context>;

export interface AuthenticateExtensionOptions {
  /**
   * An array of headers to allow in the CORS headers for the response.
   */
  corsHeaders?: string[];
}

export interface ExtensionContext {
  sessionToken: JwtPayload;
  cors: EnsureCORSFunction;
}
