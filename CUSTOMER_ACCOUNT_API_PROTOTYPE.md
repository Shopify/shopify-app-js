# Customer Account API with PKCE OAuth Prototype

This prototype implements Customer Account API support with PKCE OAuth flow following the exact patterns established by the Admin and Storefront API clients in shopify-app-js.

## ⚠️ Important: Session Separation

**Customer Account sessions MUST be separate from merchant sessions to avoid token collisions.**

- **Merchant sessions**: Store admin API tokens for the app/merchant
- **Customer sessions**: Store customer account tokens for individual customers

Use session ID pattern: `customer_account_{customerId}_{shop}`

📖 **See [CUSTOMER_ACCOUNT_SESSION_PATTERN.md](./CUSTOMER_ACCOUNT_SESSION_PATTERN.md) for full details.**

## What Was Built

### 1. Customer Account API Client Package
**Location:** `packages/api-clients/customer-account-api-client/`

A new API client package following the same structure as `admin-api-client` and `storefront-api-client`:

- **Main Client**: `customer-account-api-client.ts` - Creates and configures the GraphQL client for Customer Account API
- **Types**: `types.ts` - TypeScript types for the client configuration and operations
- **Constants**: `constants.ts` - Default headers and client metadata
- **Validations**: `validations.ts` - Input validation functions
- **Build Configuration**: TypeScript and Rollup configs for building the package

**Key Features:**
- Uses Bearer token authentication (unlike Admin's `X-Shopify-Access-Token`)
- API endpoint: `{shop}/account/customer/api/{version}/graphql`
- Built on top of `@shopify/graphql-client` base package
- Supports multiple API versions
- Custom headers for user agent tracking

### 2. PKCE OAuth Flow Implementation
**Location:** `packages/apps/shopify-api/lib/auth/oauth/customer-account-oauth/`

A complete PKCE (Proof Key for Code Exchange) OAuth implementation integrated into `@shopify/shopify-api`:

**Functions:**
- `generatePKCEParams()` - Generates code verifier and SHA256 challenge
- `discoverAuthEndpoints()` - Discovers OAuth endpoints via OpenID configuration
- `generateAuthorizationUrl()` - Builds authorization URL with PKCE parameters
- `exchangeCodeForToken()` - Exchanges authorization code for access/refresh tokens

**Security Features:**
- Cryptographically random code verifier generation
- SHA256 code challenge using native crypto APIs
- Works in both browser (Web Crypto API) and Node.js environments
- State parameter for CSRF protection
- Base64URL encoding for spec compliance

### 3. Shopify API Client Integration
**Location:** `packages/apps/shopify-api/lib/clients/customer-account/`

Customer Account client integrated into shopify-api's client classes:

**Files Created:**
- `client.ts` - CustomerAccountClient class wrapping the customer-account-api-client

**Integration:**
- Added to `api.clients.CustomerAccount` (alongside Graphql, Rest, Storefront)
- Follows exact pattern as StorefrontClient
- Uses session with access token to create authenticated client

### 4. React Router Integration  
**Location:** `packages/apps/shopify-app-react-router/src/server/`

**Client Factory** (`clients/customer-account/`):
- `factory.ts` - Simple factory using `api.clients.CustomerAccount`
- `types.ts` - TypeScript types with JSDoc examples
- Follows exact pattern as storefront client

**Authentication** (`authenticate/customer-account/`):
- `authenticate.ts` - Session-based authentication
- `types.ts` - Context types
- Returns `{session, customerAccount: {graphql}}` context
- Added to `shopify.authenticate.customerAccount(request)` API

## How to Use

### 1. Install Dependencies

```bash
# In the root of shopify-app-js monorepo
pnpm install
```

### 2. Build the Packages

```bash
# Build the customer account API client
cd packages/api-clients/customer-account-api-client
pnpm build

# Build shopify-api with PKCE support
cd ../../apps/shopify-api
pnpm build

# Build react-router with customer account auth
cd ../shopify-app-react-router
pnpm build
```

### 3. Using Customer Account API in Your App

⚠️ **IMPORTANT: Customer Account sessions must be separate from merchant sessions!**

See [CUSTOMER_ACCOUNT_SESSION_PATTERN.md](./CUSTOMER_ACCOUNT_SESSION_PATTERN.md) for full details on session separation.

#### Step 1: Initialize PKCE OAuth Flow

```typescript
// app/routes/auth/customer-account/begin.ts
import { LoaderFunctionArgs } from "react-router";
import { shopify } from "~/shopify.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  
  // Begin customer account OAuth flow
  // This handles PKCE generation, authorization URL creation, and cookie management
  await shopify.api.auth.beginCustomerAccountOAuth({
    shop: shop!,
    callbackPath: "/auth/customer-account/callback",
    isOnline: true,
  })(request, request.headers);
}
```

#### Step 2: Handle OAuth Callback & Create Customer Session

```typescript
// app/routes/auth/customer-account/callback.ts
import { LoaderFunctionArgs } from "react-router";
import { shopify } from "~/shopify.server";

export async function loader({ request }: LoaderFunctionArgs) {
  // Handle callback and create customer session
  // This exchanges the code for tokens, creates a session, and stores it
  const {session} = await shopify.api.auth.handleCustomerAccountCallback()(
    request,
    request.headers,
  );
  
  // Redirect to customer dashboard with session ID
  return redirect(`/customer/dashboard?session_id=${session.id}`);
}
```

#### Step 3: Use Customer Account API

```typescript
// app/routes/customer/profile.ts
import { LoaderFunctionArgs, json } from "react-router";
import { authenticate } from "~/shopify.server";

export async function loader({ request }: LoaderFunctionArgs) {
  // Pass customer session ID (from URL, cookie, etc.)
  // ?session_id=customer_account_123456789_shop.myshopify.com
  
  // authenticate.customerAccount loads the CUSTOMER session
  const { session, customerAccount } = await authenticate.customerAccount(request);
  
  // session.accessToken now contains the CUSTOMER token (not merchant token!)
  const response = await customerAccount.graphql(`
    query {
      customer {
        id
        email
        orders(first: 10) {
          edges { node { id } }
        }
      }
    }
  `);
  
  return json(await response.json());
}
```

### 5. Direct API Client Usage (shopify-api)

You can use the client directly through shopify-api without React Router:

```typescript
import { Session } from "@shopify/shopify-api";

// Create session with customer access token
const session = new Session({
  id: "customer-session",
  shop: "shop.myshopify.com",
  accessToken: "customer_access_token",
  state: "customer",
  isOnline: true,
});

// Use the CustomerAccount client from shopify.clients
const client = new shopify.clients.CustomerAccount({session});

const response = await client.request(`
  query {
    customer { id email }
  }
`);
```

Or use the standalone client package directly:

```typescript
import { createCustomerAccountApiClient } from "@shopify/customer-account-api-client";

const client = createCustomerAccountApiClient({
  storeDomain: "shop.myshopify.com",
  apiVersion: "2025-01",
  accessToken: "customer_access_token",
  customerAccountId: "shop.myshopify.com",
});
```

## Architecture Overview

### Package Hierarchy

```
@shopify/graphql-client (base)
├── @shopify/admin-api-client
├── @shopify/storefront-api-client
├── @shopify/customer-account-api-client (new)
└── @shopify/shopify-api
    ├── clients.Graphql (wraps admin-api-client)
    ├── clients.Storefront (wraps storefront-api-client)
    ├── clients.CustomerAccount (wraps customer-account-api-client) ← NEW
    └── auth.customerAccount* (Customer Account OAuth functions) ← NEW
        └── @shopify/shopify-app-react-router
            ├── clients/customer-account (factory using api.clients.CustomerAccount)
            └── authenticate.customerAccount (session-based auth)
```

### Design Philosophy

This implementation **exactly mirrors** the existing Admin/Storefront patterns:

1. **API Client Layer**: `@shopify/customer-account-api-client` (like admin/storefront)
2. **Shopify API Integration**: `shopify.clients.CustomerAccount` (like Graphql/Storefront)
3. **React Router Wrapper**: Simple factory pattern (like storefront client factory)
4. **Authentication**: Session-based, returns `{session, customerAccount}` context

### Authentication Flow

1. **Authorization Request**
   - Generate PKCE parameters (verifier + challenge)
   - Discover OAuth endpoints via OpenID
   - Build authorization URL with PKCE challenge
   - Redirect user to Shopify authorization page

2. **Authorization Callback**
   - Receive authorization code and state
   - Validate state parameter
   - Exchange code for tokens using PKCE verifier
   - Store access token and refresh token in session

3. **API Requests**
   - Load session with access token
   - Create Customer Account API client with token
   - Make authenticated GraphQL requests

## Key Differences from Admin/Storefront APIs

| Aspect | Admin API | Storefront API | Customer Account API |
|--------|-----------|----------------|----------------------|
| Auth Method | OAuth (app install) | Public/Private tokens | PKCE OAuth (customer login) |
| Auth Header | `X-Shopify-Access-Token` | `X-Shopify-Storefront-Access-Token` | `Authorization: Bearer` |
| Endpoint | `/admin/api/{version}/graphql.json` | `/api/{version}/graphql.json` | `/account/customer/api/{version}/graphql` |
| Token Type | Long-lived | Long-lived | Short-lived with refresh |
| Use Case | Merchant operations | Public storefront | Customer self-service |

## PKCE Implementation Details

### Code Verifier Generation
- 32 random bytes
- Base64URL encoded
- Cryptographically secure random source

### Code Challenge
- SHA256 hash of code verifier
- Base64URL encoded
- Challenge method: `S256` (RFC 7636)

### Security Considerations
- State parameter prevents CSRF attacks
- Code verifier never transmitted to authorization server
- Works without client secret (public client)
- Suitable for mobile and SPA applications

## Next Steps for Production

1. **Add Tests**
   - Unit tests for PKCE helper functions
   - Integration tests for OAuth flow
   - End-to-end tests for API client

2. **Add Token Refresh**
   - Implement automatic token refresh
   - Handle token expiration gracefully
   - Store refresh tokens securely

3. **Error Handling**
   - OAuth error responses
   - API error handling
   - Network failure recovery

4. **Documentation**
   - API reference documentation
   - Integration guides
   - Security best practices

5. **State Management**
   - Session storage for PKCE verifier
   - Secure cookie handling
   - CSRF token management

6. **Validation**
   - Redirect URI validation
   - State parameter validation
   - Token response validation

## Files Created/Modified

### New API Client Package
**`packages/api-clients/customer-account-api-client/`**
- `src/customer-account-api-client.ts` - Main client factory
- `src/types.ts` - TypeScript types
- `src/constants.ts` - Default headers/configs
- `src/validations.ts` - Input validators
- `package.json`, `tsconfig.json`, `rollup.config.cjs`

### Shopify API Changes
**`packages/apps/shopify-api/lib/`**

**PKCE OAuth** (`auth/oauth/`):
- `customer-account-oauth/` - Customer Account OAuth implementation (NEW)
- `../index.ts` - Exported customer account OAuth functions

**Client Integration** (`clients/`):
- `customer-account/client.ts` - CustomerAccountClient class (NEW)
- `index.ts` - Added to clientClasses function
- `types.ts` - Added to ShopifyClients interface

### React Router Integration
**`packages/apps/shopify-app-react-router/src/server/`**

**Clients** (`clients/customer-account/`):
- `factory.ts` - Factory using api.clients.CustomerAccount (NEW)
- `types.ts` - Context types with JSDoc (NEW)
- `index.ts` - Exports (NEW)

**Authentication** (`authenticate/customer-account/`):
- `authenticate.ts` - Session-based auth factory (NEW)
- `types.ts` - Auth context types (NEW)
- `index.ts` - Exports (NEW)

**Integration Points**:
- `shopify-app.ts` - Added customerAccount to authenticate
- `types.ts` - Added AuthenticateCustomerAccount type
- `package.json` - Added @shopify/customer-account-api-client dependency

## Testing the Prototype

### Build All Packages
```bash
# From repo root
pnpm install
pnpm build
```

### Run Type Checking
```bash
cd packages/api-clients/customer-account-api-client
pnpm tsc

cd ../../apps/shopify-api
pnpm tsc

cd ../shopify-app-react-router
pnpm tsc
```

## Resources

- [Customer Account API Documentation](https://shopify.dev/docs/api/customer)
- [PKCE RFC 7636](https://datatracker.ietf.org/doc/html/rfc7636)
- [OAuth 2.0 Authorization Code Flow](https://oauth.net/2/grant-types/authorization-code/)
- [OpenID Connect Discovery](https://openid.net/specs/openid-connect-discovery-1_0.html)