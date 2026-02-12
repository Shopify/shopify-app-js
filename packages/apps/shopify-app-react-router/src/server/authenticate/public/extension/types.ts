export type AuthenticateExtension = (
  request: Request,
  options?: AuthenticateExtensionOptions,
) => Promise<ExtensionContext>;

export interface AuthenticateExtensionOptions {
  corsHeaders?: string[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ExtensionContext {}
