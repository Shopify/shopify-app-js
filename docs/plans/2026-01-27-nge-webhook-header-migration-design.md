# NGE Webhook Header Migration Design

**Date:** 2026-01-27
**Status:** Draft
**Packages:** `@shopify/shopify-api`, `@shopify/shopify-app-react-router`

## Context

With the launch of Next Generation Events (NGE), Shopify is moving away from the `X-` prefix convention for custom HTTP headers, following RFC 6648. NGE uses lowercase headers (e.g., `shopify-hmac-sha256` instead of `X-Shopify-Hmac-Sha256`).

Since NGE is opt-in and rolling out gradually (EA February 2026, GA April 2026), apps will receive both current gen and NGE webhooks simultaneously depending on which topics they've opted into.

**Reference:** [NGE Header Migration Tech Doc](https://docs.google.com/document/d/1dlkTTnCP2Ym6MdAPI5j32G0T6wCRBOuS8VJlgt_fZSg)

## Goals

1. Support both header formats seamlessly - developers update their package and validation works
2. Maintain backwards compatibility - existing code continues to work without changes
3. Expose new fields as opt-in - developers update code only if they want new NGE fields

## Header Mappings

| Field | Current Gen | NGE |
|-------|-------------|-----|
| HMAC | `X-Shopify-Hmac-Sha256` | `shopify-hmac-sha256` |
| Topic | `X-Shopify-Topic` | `shopify-topic` |
| Domain | `X-Shopify-Shop-Domain` | `shopify-shop-domain` |
| API Version | `X-Shopify-API-Version` | `shopify-api-version` |
| Webhook ID | `X-Shopify-Webhook-Id` | TBD (see open questions) |
| Sub Topic | `X-Shopify-Sub-Topic` | — |
| Name | `X-Shopify-Name` | — |
| Handle | — | `shopify-handle` |
| Action | — | `shopify-action` |
| Resource ID | — | `shopify-resource-id` |
| Triggered At | `X-Shopify-Triggered-At` | `shopify-triggered-at` |
| Event ID | `X-Shopify-Event-Id` | `shopify-event-id` |

## Design Decisions

### 1. Detection Order

Check current gen headers first, fall back to NGE. This optimizes for the common case during the gradual rollout where most webhooks will still be current gen.

### 2. Backwards Compatibility

Add new fields as optional to existing `WebhookFields` interface. Existing code accessing `domain`, `topic`, etc. works without changes. New code can check `webhookType` or access optional fields with null handling.

### 3. Architecture

Add webhook type detection as step 0 in validation flow:

```
Step 0: detectWebhookType() → 'current_gen' | 'nge'
    ↓
Step 1: validateHmac() using appropriate header based on type
    ↓
Step 2: extractHeaders() using appropriate header names based on type
    ↓
Return: WebhookFields with webhookType set
```

### 4. Header Mappings Structure

Create a dedicated mapping object per webhook type rather than extending the existing `ShopifyHeader` enum (which is used elsewhere for OAuth, REST client, etc.).

## Implementation

### New File: `lib/webhooks/header-names.ts`

```typescript
export const WebhookType = {
  CurrentGen: 'current_gen',
  NextGen: 'nge',
} as const;

export type WebhookTypeValue = (typeof WebhookType)[keyof typeof WebhookType];

export const WEBHOOK_HEADER_NAMES = {
  [WebhookType.CurrentGen]: {
    hmac: 'X-Shopify-Hmac-Sha256',
    topic: 'X-Shopify-Topic',
    domain: 'X-Shopify-Shop-Domain',
    apiVersion: 'X-Shopify-API-Version',
    webhookId: 'X-Shopify-Webhook-Id',
    subTopic: 'X-Shopify-Sub-Topic',
    name: 'X-Shopify-Name',
    triggeredAt: 'X-Shopify-Triggered-At',
    eventId: 'X-Shopify-Event-Id',
  },
  [WebhookType.NextGen]: {
    hmac: 'shopify-hmac-sha256',
    topic: 'shopify-topic',
    domain: 'shopify-shop-domain',
    apiVersion: 'shopify-api-version',
    eventId: 'shopify-event-id',
    handle: 'shopify-handle',
    action: 'shopify-action',
    resourceId: 'shopify-resource-id',
    triggeredAt: 'shopify-triggered-at',
  },
} as const;
```

### Type Changes: `lib/webhooks/types.ts`

```typescript
import {WebhookTypeValue} from './header-names';

export interface WebhookFields {
  // Existing required fields (unchanged)
  webhookId: string;
  apiVersion: string;
  domain: string;
  hmac: string;
  topic: string;
  subTopic?: string;

  // New optional fields
  webhookType?: WebhookTypeValue;

  // Current gen specific
  name?: string;

  // NGE specific
  handle?: string;
  action?: string;
  resourceId?: string;

  // Previously unexposed, now optional on both
  triggeredAt?: string;
  eventId?: string;
}
```

### Detection Function: `lib/webhooks/validate.ts`

```typescript
import {WEBHOOK_HEADER_NAMES, WebhookType, WebhookTypeValue} from './header-names';

function detectWebhookType(headers: Headers): WebhookTypeValue {
  // Check for current gen first (most common during rollout)
  const currentGenHmac = getHeader(headers, WEBHOOK_HEADER_NAMES.current_gen.hmac);
  if (currentGenHmac) {
    return WebhookType.CurrentGen;
  }

  // Fall back to NGE
  const ngeHmac = getHeader(headers, WEBHOOK_HEADER_NAMES.nge.hmac);
  if (ngeHmac) {
    return WebhookType.NextGen;
  }

  // Default to current gen (will fail validation with missing_hmac)
  return WebhookType.CurrentGen;
}
```

### HMAC Validation: `lib/utils/hmac-validator.ts`

Add optional `webhookType` parameter. When provided, use the appropriate header name from the mapping. When not provided (for non-webhook HMAC validation), fall back to existing behavior.

### Header Extraction: `lib/webhooks/validate.ts`

Update `checkWebhookHeaders()` to:
1. Accept `webhookType` parameter
2. Use appropriate header names based on type
3. Extract type-specific optional fields (name for current gen, handle/action/resourceId for NGE)
4. Set `webhookType` on the returned fields

### React Router: `authenticate/webhooks/`

Update `WebhookContext` interface with new optional fields and pass them through from validation result.

## Testing

### shopify-api

1. Extend `headers()` helper in `utils.ts` to support NGE header format
2. Add test cases for NGE webhook validation
3. Add parameterized tests for both header formats
4. Test detection logic (current gen first, NGE fallback)

### shopify-app-react-router

1. Extend `webhookHeaders()` helper for NGE format
2. Add test cases verifying new fields are passed through context

## Open Questions

1. **NGE webhookId equivalent:** Does NGE have a `webhookId` header, or does `eventId` serve that purpose? Need confirmation from NGE team before finalizing required fields for NGE.

## Out of Scope

- `@shopify/shopify-app-express` and `@shopify/shopify-app-remix` packages (may add later)
- Topic-specific headers like `X-Shopify-Order-Id` → `shopify-resource-id` migration

## Rollout

This is a non-breaking change. Developers update their package version and webhook validation works for both current gen and NGE without code changes. To access new fields, developers opt-in by checking `webhookType` or accessing the new optional fields.
