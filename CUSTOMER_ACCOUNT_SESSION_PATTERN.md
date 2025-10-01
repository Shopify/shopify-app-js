# Customer Account API Session Pattern

## Problem: Session Token Collision

Customer Account API tokens are for **individual customers**, not merchants. Storing them in the same `session.accessToken` field as merchant tokens would cause collisions.

## Solution: Separate Customer Account Sessions

Customer Account sessions are **completely separate** from merchant sessions:

```typescript
// Merchant session (from app installation OAuth)
{
  id: "offline_shop.myshopify.com",
  shop: "shop.myshopify.com",
  accessToken: "shpat_xxxxx",  // ← Merchant access token
  isOnline: false,
  state: "123456"
}

// Customer Account session (from customer login PKCE OAuth)
{
  id: "customer_account_123456789_shop.myshopify.com",
  shop: "shop.myshopify.com",
  accessToken: "customer_token_xxxxx",  // ← Customer access token
  isOnline: true,
  state: "customer_account",
  scope: "openid email customer-account-api:full"
}
```

## Session ID Pattern

Customer Account sessions use a specific ID pattern to avoid collisions:

```
customer_account_{customerId}_{shop}
```

Example: `customer_account_123456789_shop.myshopify.com`

This ensures:
- ✅ No collision with merchant sessions
- ✅ One session per customer per shop
- ✅ Easy to identify session type
- ✅ Works with existing session storage

## Creating a Customer Account Session

Customer account sessions are automatically created by the OAuth callback handler:

```typescript
// Handle OAuth callback
// This automatically exchanges the code for tokens, creates a session with
// the pattern customer_account_{customerId}_{shop}, and stores it
const {session} = await shopify.api.auth.handleCustomerAccountCallback()(
  request,
  request.headers,
);

// Session is already stored in session storage with ID: customer_account_{customerId}_{shop}
// session.accessToken contains the customer access token
// session.id follows the pattern: "customer_account_123456789_shop.myshopify.com"
```

## Using Customer Account Sessions

In your React Router routes:

```typescript
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  
  // Pass customer session ID (from client-side state, cookie, etc.)
  const customerSessionId = url.searchParams.get('session_id');
  
  // Authenticate loads the CUSTOMER session (not merchant session)
  const { session, customerAccount } = 
    await authenticate.customerAccount(request);
  
  // session.accessToken is the CUSTOMER token
  const response = await customerAccount.graphql(`
    query { customer { id email } }
  `);
  
  return await response.json();
}
```

## Session Storage Considerations

### Same Storage, Different Sessions

Both merchant and customer sessions use the **same session storage** (Redis, PostgreSQL, etc.) but with different IDs:

```typescript
// Merchant sessions
await sessionStorage.storeSession(merchantSession);
// Stored as: "offline_shop.myshopify.com"

// Customer sessions  
await sessionStorage.storeSession(customerSession);
// Stored as: "customer_account_123456789_shop.myshopify.com"
```

### Session Cleanup

Consider lifecycle differences:
- **Merchant sessions**: Long-lived (until app uninstall)
- **Customer sessions**: Short-lived (hours/days, tied to customer login)

You may want to:
1. Add session type metadata for cleanup jobs
2. Use TTL in session storage for customer sessions
3. Clean up customer sessions on logout

## Token Refresh Pattern

Customer Account tokens expire faster than merchant tokens. Token refresh functionality needs to be implemented as a separate workflow when needed. The refresh token is stored in the session and can be used to obtain new access tokens without requiring the customer to re-authenticate.

## Security Considerations

1. **Session ID in URL**: The example uses `?session_id=...` for simplicity. In production:
   - Store customer session ID in secure HTTP-only cookies
   - Or use encrypted client-side storage
   - Never expose session tokens

2. **CSRF Protection**: Customer Account sessions should have CSRF tokens

3. **Session Hijacking**: Use secure cookies, HTTPS only, short expiration

4. **Logout**: Properly clean up customer sessions on logout

## Comparison Table

| Aspect | Merchant Session | Customer Session |
|--------|-----------------|------------------|
| Purpose | App accesses shop data | Customer accesses their data |
| Created by | App installation OAuth | Customer login PKCE OAuth |
| ID Pattern | `offline_{shop}` or `online_{userId}_{shop}` | `customer_account_{customerId}_{shop}` |
| Token type | Admin API access token | Customer Account API token |
| Lifecycle | Long (months/years) | Short (hours/days) |
| Scope | Admin scopes | Customer Account scopes |
| Refresh | Rare | Frequent |

## Example: Full Flow

```typescript
// 1. Customer clicks "Login with Shopify"
export async function loader({ request }: LoaderFunctionArgs) {
  // Begin customer account OAuth - handles PKCE generation and authorization URL
  await shopify.api.auth.beginCustomerAccountOAuth({
    shop: "shop.myshopify.com",
    callbackPath: "/auth/customer-account/callback",
    isOnline: true,
  })(request, request.headers);
}

// 2. Callback after customer authorizes
export async function callbackLoader({ request }: LoaderFunctionArgs) {
  // Handle callback - exchanges code for tokens and creates customer session
  // Session ID automatically uses pattern: customer_account_{customerId}_{shop}
  const {session} = await shopify.api.auth.handleCustomerAccountCallback()(
    request,
    request.headers,
  );
  
  // Session is automatically stored in session storage
  // Redirect to customer dashboard
  return redirect(`/customer/dashboard?session_id=${session.id}`);
}

// 3. Customer views their data
export async function dashboardLoader({ request }: LoaderFunctionArgs) {
  // authenticate.customerAccount loads the CUSTOMER session
  const { session, customerAccount } = 
    await authenticate.customerAccount(request);
  
  const response = await customerAccount.graphql(`
    query { customer { id email orders(first: 10) { edges { node { id } } } } }
  `);
  
  return await response.json();
}
```

## Summary

✅ **DO**: Create separate sessions with distinct IDs for customer accounts  
✅ **DO**: Use `customer_account_{customerId}_{shop}` pattern  
✅ **DO**: Store both merchant and customer sessions in the same storage  
❌ **DON'T**: Store customer tokens in merchant session's `accessToken`  
❌ **DON'T**: Mix merchant and customer authentication in the same session