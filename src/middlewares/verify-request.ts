import { Shopify } from "@shopify/shopify-api";
import { CONFIG } from "../config";
import { ensureBilling } from "../helpers/ensure-billing";

const TEST_GRAPHQL_QUERY = `
{
  shop {
    name
  }
}`;

export async function verifyRequest(req: any, res: any, next: any) {
  const session = await Shopify.Utils.loadCurrentSession(
    req,
    res,
    CONFIG.useOnlineTokens
  );

  const authPath = `${CONFIG.rootPath}/auth`;

  let shop = req.query.shop;

  if (session && shop && session.shop !== shop) {
    // The current request is for a different shop. Redirect gracefully.
    return res.redirect(`${authPath}?shop=${shop}`);
  }

  if (session?.isActive()) {
    try {
      if (CONFIG.billing.required) {
        // The request to check billing status serves to validate that the access token is still valid.
        const [hasPayment, confirmationUrl] = await ensureBilling(session);

        if (!hasPayment) {
          return accessDeniedRedirect(req, res, next, confirmationUrl as string);
        }
      } else {
        // Make a request to ensure the access token is still valid. Otherwise, re-authenticate the user.
        const client = new Shopify.Clients.Graphql(
          session.shop,
          session.accessToken
        );
        await client.query({ data: TEST_GRAPHQL_QUERY });
      }

      res.locals.shopify = { session };

      return next();
    } catch (e) {
      if (
        e instanceof Shopify.Errors.HttpResponseError &&
        e.response.code === 401
      ) {
        // Re-authenticate if we get a 401 response
      } else if (e instanceof Shopify.Errors.BillingError) {
        console.error(e.message, e.errorData[0]);
        res.status(500).end();
        return;
      } else {
        throw e;
      }
    }
  }

  const bearerPresent = req.headers.authorization?.match(/Bearer (.*)/);
  if (bearerPresent) {
    if (!shop) {
      if (session) {
        shop = session.shop;
      } else if (Shopify.Context.IS_EMBEDDED_APP) {
        if (bearerPresent) {
          const payload = Shopify.Utils.decodeSessionToken(bearerPresent[1]);
          shop = payload.dest.replace("https://", "");
        }
      }
    }
  }

  return accessDeniedRedirect(req, res, next, `${authPath}?shop=${shop}`);
}

function accessDeniedRedirect(req: any, res: any, next: any, url: string) {
  if (CONFIG.accessDeniedRedirect) {
    return CONFIG.accessDeniedRedirect(req, res, next, url);
  } else {
    return res.redirect(url);
  }
}
