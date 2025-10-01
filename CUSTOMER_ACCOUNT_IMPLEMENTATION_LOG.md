# Customer Account API Implementation Log

**Date:** September 30, 2025  
**Status:** Complete - Prototype Ready

## Overview

This document captures the complete implementation of the Shopify Customer Account API with PKCE OAuth flow in the shopify-app-js monorepo. This implementation follows existing patterns for Admin and Storefront API clients.

## Table of Contents

1. [Agent Work](#agent-work)
2. [Architecture Overview](#architecture-overview)
3. [Key Decisions](#key-decisions)
4. [Implementation Details](#implementation-details)
5. [Session Storage Changes](#session-storage-changes)
6. [Files Created/Modified](#files-createdmodified)
7. [API Usage](#api-usage)
8. [Next Steps](#next-steps)

---

## Agent Work

### Initial Research Agents

Two expert agents were launched to prototype the feature:

**Agent 1: Customer Account API Expert**
- Researched PKCE OAuth flow from https://shopify.dev/docs/api/customer
- Understood Customer Account API authentication requirements
- Identified key differences from merchant OAuth (PKCE vs standard OAuth)

**Agent 2: Codebase Architecture Expert**  
- Analyzed existing Admin and Storefront API client patterns
- Mapped package dependencies and interactions
- Identified the three-layer architecture pattern to follow

### Refactoring Agent

**OAuth Structure Refactoring Agent**
- Examined existing admin OAuth patterns in `/packages/apps/shopify-api/lib/auth/oauth/`
- Split monolithic PKCE implementation into separate focused files
- Created proper folder structure following admin OAuth conventions
- Ensured session creation follows existing patterns

**Key Insight from Agents:**
The agents identified that the implementation should NOT be a complex authentication system in react-router, but rather:
1. Standalone API client package (`@shopify/customer-account-api-client`)
2. Wrapper class in shopify-api (`CustomerAccountClient`)
3. Simple factory in react-router (`clients/customer-account/factory.ts`)

---

## Architecture Overview

### Three-Layer Architecture

```
@shopify/graphql-client (base)
├── @shopify/customer-account-api-client (NEW - standalone client)
└── @shopify/shopify-api
    ├── clients.CustomerAccount (NEW - wrapper)
    └── auth.beginCustomerAccountOAuth (NEW - OAuth)
    └── auth.handleCustomerAccountCallback (NEW - OAuth)
        └── @shopify/shopify-app-react-router
            ├── clients/customer-account (NEW - factory)
            └── authenticate.customerAccount (NEW - auth)
```

### Package Structure

**Standalone Client:**
- `packages/api-clients/customer-account-api-client/`
- Handles GraphQL requests with Bearer token authentication
- Endpoint: `{shop}/account/customer/api/{version}/graphql`

**Shopify API Integration:**
- `packages/apps/shopify-api/lib/clients/customer-account/`
- `packages/apps/shopify-api/lib/auth/oauth/customer-account-oauth/`
- Provides PKCE OAuth flow and client wrappers

**React Router Integration:**
- `packages/apps/shopify-app-react-router/src/server/clients/customer-account/`
- `packages/apps/shopify-app-react-router/src/server/authenticate/customer-account/`
- Simple factory pattern and session-based authentication

---

## Key Decisions

### 1. Session Separation Pattern

**Problem:** Customer Account tokens are for individual customers, not merchants. Storing them in the same `session.accessToken` field would cause collisions.

**Solution:** Use separate sessions with distinct ID patterns:
- **Merchant sessions:** `offline_{shop}` or `{shop}_{userId}`
- **Customer sessions:** `customer_account_{customerId}_{shop}`

Both session types use the **same storage** but with different IDs.

**Implementation:**
- Added `getCustomerAccountSessionId()` function in `session-utils.ts`
- Follows exact pattern of `getOfflineId()` and `getJwtSessionId()`

### 2. OAuth Structure Following Admin Pattern

**Problem:** Initial implementation had PKCE OAuth in a single monolithic file.

**Solution:** Refactored to match admin OAuth structure:

```
oauth/customer-account-oauth/
├── types.ts                 # Type definitions
├── pkce-utils.ts           # PKCE generation & utilities  
├── discovery.ts            # OpenID endpoint discovery
├── begin-oauth.ts          # Start OAuth flow
├── callback.ts             # Handle OAuth callback & token exchange
├── create-session.ts       # Session creation
└── index.ts                # Main exports
```

### 3. Public API Simplification

**Decision:** Only expose two public functions:
- `shopify.api.auth.beginCustomerAccountOAuth()`
- `shopify.api.auth.handleCustomerAccountCallback()`

All other functions (generatePKCEParams, exchangeCodeForToken, etc.) are internal implementation details.

**Rationale:** Keep the API simple and hide complexity. All PKCE details handled internally.

### 4. Session Token Storage

**Problem:** Customer Account OAuth returns three tokens:
- `access_token` - Used for API requests
- `id_token` - JWT with customer identity claims
- `refresh_token` - Used to obtain new access tokens

**Solution:** Extend the Session class with optional fields:
```typescript
public idToken?: string;
public refreshToken?: string;
```

**Why Option 1 (Extend Session) over Option 2 (Separate Table)?**
- Session class already has conditional fields (`onlineAccessInfo`)
- Simpler to implement
- Works with existing session storage adapters
- Unique session IDs already provide separation

### 5. Prisma Migration Approach

**Initial Mistake:** Directly edited schema.prisma files.

**Correction:** Created proper Prisma migration:
- Migration: `20250930135801_add_customer_account_tokens`
- Adds `idToken` and `refreshToken` columns
- Ensures reproducibility across environments
- Provides rollback capability

---

## Implementation Details

### PKCE OAuth Flow

**1. Begin OAuth (`begin-oauth.ts`):**
```typescript
await shopify.api.auth.beginCustomerAccountOAuth({
  shop: "shop.myshopify.com",
  callbackPath: "/auth/customer-account/callback",
  isOnline: true,
})(request, request.headers);
```

**What it does:**
- Generates cryptographically secure PKCE code verifier (32 random bytes, Base64URL)
- Creates SHA256 code challenge from verifier
- Generates random state for CSRF protection
- Stores verifier and state in signed cookies
- Discovers OAuth endpoints via OpenID configuration
- Redirects to Shopify authorization page

**2. Handle Callback (`callback.ts`):**
```typescript
const {session} = await shopify.api.auth.handleCustomerAccountCallback()(
  request,
  request.headers,
);
```

**What it does:**
- Validates state parameter from cookie
- Retrieves code verifier from cookie
- Exchanges authorization code for tokens using PKCE verifier
- Extracts customer ID from `id_token` JWT payload
- Creates session with ID: `customer_account_{customerId}_{shop}`
- Stores session with all three tokens (access, id, refresh)

### Session Creation Flow

**Extract Customer ID from JWT:**
```typescript
function extractCustomerIdFromIdToken(idToken: string): string {
  const payload = JSON.parse(
    Buffer.from(idToken.split('.')[1], 'base64').toString()
  );
  return payload.sub; // Customer ID
}
```

**Create Customer Account Session:**
```typescript
const session = new Session({
  id: `customer_account_${customerId}_${shop}`,
  shop: cleanShop,
  state,
  isOnline: true,
  accessToken: tokenResponse.access_token,
  idToken: tokenResponse.id_token,           // NEW
  refreshToken: tokenResponse.refresh_token,  // NEW
  scope: 'customer-account-api:full',
  expires: new Date(Date.now() + tokenResponse.expires_in * 1000),
});
```

### Customer Account Client Usage

**In React Router routes:**
```typescript
export async function loader({ request }: LoaderFunctionArgs) {
  // Loads customer session (not merchant session)
  const { session, customerAccount } = 
    await authenticate.customerAccount(request);
  
  // session.accessToken contains customer token
  // session.idToken contains customer identity JWT
  // session.refreshToken available for token refresh
  
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
  
  return await response.json();
}
```

---

## Session Storage Changes

### Session Class Updates

**File:** `packages/apps/shopify-api/lib/session/session.ts`

**Changes:**
1. Added to `propertiesToSave` array:
   - `'idToken'`
   - `'refreshToken'`

2. Added public properties:
   ```typescript
   public idToken?: string;
   public refreshToken?: string;
   ```

3. Updated `toObject()` method to serialize these fields

4. Added case mappings in `fromPropertyArray()`:
   ```typescript
   case 'idtoken':
     return ['idToken', value];
   case 'refreshtoken':
     return ['refreshToken', value];
   ```

### Session Types Updates

**File:** `packages/apps/shopify-api/lib/session/types.ts`

**Added to SessionParams interface:**
```typescript
/**
 * The ID token (JWT) for customer account sessions. Contains customer identity claims.
 */
idToken?: string;
/**
 * The refresh token for customer account sessions. Used to obtain new access tokens.
 */
refreshToken?: string;
```

### Session Utilities

**File:** `packages/apps/shopify-api/lib/session/session-utils.ts`

**Added function:**
```typescript
export function getCustomerAccountSessionId(config: ConfigInterface) {
  return (shop: string, customerId: string): string => {
    return `customer_account_${customerId}_${sanitizeShop(config)(shop, true)}`;
  };
}
```

**Exported in:** `packages/apps/shopify-api/lib/session/index.ts`
```typescript
export function shopifySession(config: ConfigInterface) {
  return {
    // ... existing exports
    getCustomerAccountSessionId: getCustomerAccountSessionId(config),
  };
}
```

### Prisma Storage Adapter

**Schema Migration:** `20250930135801_add_customer_account_tokens/migration.sql`
```sql
-- AlterTable
ALTER TABLE "Session" ADD COLUMN "idToken" TEXT;
ALTER TABLE "Session" ADD COLUMN "refreshToken" TEXT;

-- AlterTable  
ALTER TABLE "MySession" ADD COLUMN "idToken" TEXT;
ALTER TABLE "MySession" ADD COLUMN "refreshToken" TEXT;
```

**Adapter Updates:** `packages/apps/session-storage/shopify-app-session-storage-prisma/src/prisma.ts`

**sessionToRow():**
```typescript
return {
  // ... existing fields
  idToken: session.idToken || null,
  refreshToken: session.refreshToken || null,
};
```

**rowToSession():**
```typescript
if (row.idToken) {
  sessionParams.idToken = row.idToken;
}

if (row.refreshToken) {
  sessionParams.refreshToken = row.refreshToken;
}
```

### Other Storage Adapters

**Status:** Not yet updated, but will continue to work because:
- `idToken` and `refreshToken` are optional fields
- Session serialization handles them automatically
- Adapters that don't persist these fields simply won't store them
- No breaking changes to existing functionality

**To Add Full Support:** Update schemas/models in:
- MySQL
- PostgreSQL
- MongoDB
- Redis (if using structured storage)
- SQLite
- DynamoDB
- Drizzle

---

## Files Created/Modified

### New API Client Package

**Created:** `packages/api-clients/customer-account-api-client/`

```
customer-account-api-client/
├── src/
│   ├── customer-account-api-client.ts  # Main client factory
│   ├── types.ts                        # TypeScript types
│   ├── constants.ts                    # Default headers/configs
│   ├── validations.ts                  # Input validators
│   └── index.ts                        # Exports
├── package.json
├── tsconfig.json
└── rollup.config.cjs
```

### Shopify API Changes

**Created:** `packages/apps/shopify-api/lib/auth/oauth/customer-account-oauth/`

```
customer-account-oauth/
├── types.ts                 # Type definitions
├── pkce-utils.ts           # PKCE parameter generation
├── discovery.ts            # OAuth endpoint discovery
├── begin-oauth.ts          # Start OAuth flow
├── callback.ts             # Handle callback & token exchange
├── create-session.ts       # Session creation
└── index.ts                # Main exports
```

**Created:** `packages/apps/shopify-api/lib/clients/customer-account/`
- `client.ts` - CustomerAccountClient class

**Modified:** `packages/apps/shopify-api/lib/`
- `auth/index.ts` - Added customer account OAuth exports
- `clients/index.ts` - Added CustomerAccount to clientClasses
- `clients/types.ts` - Added CustomerAccount to ShopifyClients interface
- `session/session.ts` - Added idToken and refreshToken fields
- `session/types.ts` - Added idToken and refreshToken to SessionParams
- `session/session-utils.ts` - Added getCustomerAccountSessionId
- `session/index.ts` - Exported getCustomerAccountSessionId

### React Router Integration

**Created:** `packages/apps/shopify-app-react-router/src/server/clients/customer-account/`
- `factory.ts` - Factory using api.clients.CustomerAccount
- `types.ts` - Context types with JSDoc
- `index.ts` - Exports

**Created:** `packages/apps/shopify-app-react-router/src/server/authenticate/customer-account/`
- `authenticate.ts` - Session-based auth factory
- `types.ts` - Auth context types
- `index.ts` - Exports

**Modified:** `packages/apps/shopify-app-react-router/src/server/`
- `shopify-app.ts` - Added customerAccount to authenticate
- `types.ts` - Added AuthenticateCustomerAccount type
- `package.json` - Added @shopify/customer-account-api-client dependency

### Session Storage Changes

**Modified:** `packages/apps/session-storage/shopify-app-session-storage-prisma/`
- `prisma/schema.prisma` - Added idToken and refreshToken fields
- `src/prisma.ts` - Updated sessionToRow and rowToSession
- `README.md` - Updated schema documentation

**Created Migration:**
- `prisma/migrations/20250930135801_add_customer_account_tokens/migration.sql`

### Documentation

**Created:**
- `CUSTOMER_ACCOUNT_API_PROTOTYPE.md` - Implementation guide
- `CUSTOMER_ACCOUNT_SESSION_PATTERN.md` - Session separation details
- `CUSTOMER_ACCOUNT_IMPLEMENTATION_LOG.md` - This file

**Modified:**
- Both prototype documents updated to reflect simplified API

---

## API Usage

### Complete Flow Example

```typescript
// 1. Start OAuth Flow
// app/routes/auth/customer-account/begin.ts
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  
  // Handles PKCE generation, authorization URL, cookie management
  await shopify.api.auth.beginCustomerAccountOAuth({
    shop: shop!,
    callbackPath: "/auth/customer-account/callback",
    isOnline: true,
  })(request, request.headers);
}

// 2. Handle OAuth Callback
// app/routes/auth/customer-account/callback.ts
export async function loader({ request }: LoaderFunctionArgs) {
  // Exchanges code for tokens and creates customer session
  const {session} = await shopify.api.auth.handleCustomerAccountCallback()(
    request,
    request.headers,
  );
  
  // Session ID: customer_account_{customerId}_{shop}
  // Contains: accessToken, idToken, refreshToken
  
  return redirect(`/customer/dashboard?session_id=${session.id}`);
}

// 3. Use Customer Account API
// app/routes/customer/profile.ts
export async function loader({ request }: LoaderFunctionArgs) {
  // Loads CUSTOMER session (not merchant session)
  const { session, customerAccount } = 
    await authenticate.customerAccount(request);
  
  const response = await customerAccount.graphql(`
    query {
      customer {
        id
        email
        firstName
        lastName
        orders(first: 10) {
          edges {
            node {
              id
              orderNumber
              totalPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  `);
  
  return json(await response.json());
}
```

### Direct API Client Usage

```typescript
import { Session } from "@shopify/shopify-api";

// Create customer session
const session = new Session({
  id: "customer_account_123456789_shop.myshopify.com",
  shop: "shop.myshopify.com",
  accessToken: "customer_access_token",
  idToken: "eyJhbGc...",
  refreshToken: "refresh_token_here",
  state: "customer_account",
  isOnline: true,
  expires: new Date(Date.now() + 3600000),
});

// Use CustomerAccount client
const client = new shopify.clients.CustomerAccount({session});

const response = await client.request(`
  query { customer { id email } }
`);
```

---

## Next Steps

### Immediate (For Production)

1. **Token Refresh Implementation**
   - Add refresh token flow in `customer-account-oauth/`
   - Handle token expiration gracefully
   - Update session with new tokens

2. **Update Other Session Storage Adapters**
   - Add `idToken` and `refreshToken` to schemas/models:
     - MySQL
     - PostgreSQL
     - MongoDB
     - Redis
     - SQLite
     - DynamoDB
     - Drizzle

3. **Testing**
   - Unit tests for PKCE functions
   - Integration tests for OAuth flow
   - End-to-end tests for full workflow
   - Test token refresh
   - Test session separation

4. **Error Handling**
   - OAuth error responses
   - API error handling
   - Network failure recovery
   - Token validation errors

5. **Security Review**
   - State parameter validation
   - CSRF protection
   - Secure cookie configuration
   - Token storage security
   - Session hijacking prevention

### Future Enhancements

1. **Session Management**
   - Customer session logout
   - Session cleanup for expired tokens
   - TTL configuration for customer sessions

2. **Monitoring & Logging**
   - OAuth flow metrics
   - Token refresh metrics
   - Error rate monitoring
   - Performance tracking

3. **Developer Experience**
   - TypeScript types for Customer Account API operations
   - Code generation from GraphQL schema
   - Better error messages
   - More examples and documentation

4. **Advanced Features**
   - Multiple customer sessions per shop
   - Customer session migration
   - Token rotation policies
   - Rate limiting for token refresh

---

## Key Differences: Customer Account vs Admin/Storefront

| Aspect | Admin API | Storefront API | Customer Account API |
|--------|-----------|----------------|----------------------|
| **Auth Method** | OAuth (app install) | Public/Private tokens | PKCE OAuth (customer login) |
| **Auth Header** | `X-Shopify-Access-Token` | `X-Shopify-Storefront-Access-Token` | `Authorization: Bearer` |
| **Endpoint** | `/admin/api/{version}/graphql.json` | `/api/{version}/graphql.json` | `/account/customer/api/{version}/graphql` |
| **Token Type** | Long-lived | Long-lived | Short-lived with refresh |
| **Token Count** | 1 (access_token) | 1 (access_token) | 3 (access, id, refresh) |
| **Use Case** | Merchant operations | Public storefront | Customer self-service |
| **Session ID** | `offline_{shop}` or `{shop}_{userId}` | N/A | `customer_account_{customerId}_{shop}` |
| **Token Storage** | session.accessToken | N/A | session.accessToken + idToken + refreshToken |

---

## Lessons Learned

1. **Follow Existing Patterns**: The agent approach to analyzing existing code first before implementing saved significant refactoring time.

2. **Session Separation is Critical**: Early identification of token collision issue prevented data corruption bugs.

3. **Migrations > Direct Schema Edits**: Using proper migrations ensures reproducibility and provides rollback capability.

4. **Public API Simplicity**: Hiding complexity behind two simple functions makes the API much easier to use.

5. **Optional Fields are Flexible**: Adding optional fields to Session class allowed incremental rollout without breaking existing adapters.

---

## References

- [Customer Account API Documentation](https://shopify.dev/docs/api/customer)
- [PKCE RFC 7636](https://datatracker.ietf.org/doc/html/rfc7636)
- [OAuth 2.0 Authorization Code Flow](https://oauth.net/2/grant-types/authorization-code/)
- [OpenID Connect Discovery](https://openid.net/specs/openid-connect-discovery-1_0.html)
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)

---

**Last Updated:** September 30, 2025  
**Implementation Status:** ✅ Complete - Ready for Testing  
**Breaking Changes:** None - Fully backward compatible