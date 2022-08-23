type TopLevelAuthRedirectParams = {
  apiKey: string,
  hostName: string,
  shop: string,
  rootPath: string,
}

export function topLevelAuthRedirect({ apiKey, hostName, shop, rootPath }: TopLevelAuthRedirectParams): string {
  const authPath = `${rootPath}/auth`;

  return `<!DOCTYPE html>
<html>
  <head>
    <script src="https://unpkg.com/@shopify/app-bridge@3.1.0"></script>
    <script src="https://unpkg.com/@shopify/app-bridge-utils@3.1.0"></script>

    <script>
      document.addEventListener('DOMContentLoaded', function () {
        var appBridgeUtils = window['app-bridge-utils'];

        if (appBridgeUtils.isShopifyEmbedded()) {
          var AppBridge = window['app-bridge'];
          var createApp = AppBridge.default;
          var Redirect = AppBridge.actions.Redirect;

          const app = createApp({
            apiKey: '${apiKey}',
            shopOrigin: '${shop}',
          });

          const redirect = Redirect.create(app);

          redirect.dispatch(
            Redirect.Action.REMOTE,
            'https://${hostName}${authPath}/toplevel?shop=${shop}',
          );
        } else {
          window.location.href = '${authPath}?shop=${shop}';
        }
      });
    </script>
  </head>
  <body></body>
</html>`;
}
