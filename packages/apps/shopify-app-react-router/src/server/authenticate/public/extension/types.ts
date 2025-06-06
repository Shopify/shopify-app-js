export type AuthenticateExtension = (
  request: Request,
  options?: AuthenticateExtensionOptions,
) => Promise<ExtensionContext>;

export interface AuthenticateExtensionOptions {
  corsHeaders?: string[];
}

export interface ExtensionContext {}
