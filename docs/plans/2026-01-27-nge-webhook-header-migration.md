# NGE Webhook Header Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Support both current gen (`X-Shopify-*`) and NGE (`shopify-*`) webhook headers for HMAC validation and field extraction.

**Architecture:** Add webhook type detection as step 0 in validation flow. Check current gen headers first (most common during rollout), fall back to NGE. Extract headers using type-appropriate mappings. All new fields are optional for backwards compatibility.

**Tech Stack:** TypeScript, Jest, Express (for tests), supertest

**Design Doc:** `docs/plans/2026-01-27-nge-webhook-header-migration-design.md`

---

## Task 1: Add Header Name Constants

**Files:**
- Create: `packages/apps/shopify-api/lib/webhooks/header-names.ts`

**Step 1: Create the header names file**

```typescript
// packages/apps/shopify-api/lib/webhooks/header-names.ts
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

**Step 2: Verify file compiles**

Run: `cd packages/apps/shopify-api && npx tsc --noEmit lib/webhooks/header-names.ts`
Expected: No errors

**Step 3: Commit**

```bash
git add packages/apps/shopify-api/lib/webhooks/header-names.ts
git commit -m "feat(webhooks): add NGE header name constants"
```

---

## Task 2: Update WebhookFields Type

**Files:**
- Modify: `packages/apps/shopify-api/lib/webhooks/types.ts:143-150`

**Step 1: Add import and extend WebhookFields interface**

Add import at top of file (after line 3):
```typescript
import {WebhookTypeValue} from './header-names';
```

Replace the `WebhookFields` interface (lines 143-150) with:
```typescript
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

**Step 2: Verify types compile**

Run: `cd packages/apps/shopify-api && npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add packages/apps/shopify-api/lib/webhooks/types.ts
git commit -m "feat(webhooks): add optional NGE fields to WebhookFields"
```

---

## Task 3: Extend Test Helper for NGE Headers

**Files:**
- Modify: `packages/apps/shopify-api/lib/webhooks/__tests__/utils.ts`

**Step 1: Add import for header names**

Add after line 5:
```typescript
import {WEBHOOK_HEADER_NAMES, WebhookType, WebhookTypeValue} from '../header-names';
```

**Step 2: Update headers function signature and implementation**

Replace the entire `headers` function (lines 24-62) with:
```typescript
export function headers({
  apiVersion = '2023-01',
  domain = 'shop1.myshopify.io',
  hmac = 'fake',
  topic = 'products/create',
  webhookId = '123456789',
  subTopic = '',
  lowercase = false,
  webhookType = 'current_gen' as WebhookTypeValue,
  // NGE-specific fields
  handle = '',
  action = '',
  resourceId = '',
  triggeredAt = '',
  eventId = '',
  // Current gen specific
  name = '',
}: {
  apiVersion?: string;
  domain?: string;
  hmac?: string;
  topic?: string;
  webhookId?: string;
  subTopic?: string;
  lowercase?: boolean;
  webhookType?: WebhookTypeValue;
  handle?: string;
  action?: string;
  resourceId?: string;
  triggeredAt?: string;
  eventId?: string;
  name?: string;
} = {}) {
  if (webhookType === 'nge') {
    const ngeHeaders = WEBHOOK_HEADER_NAMES.nge;
    return {
      [ngeHeaders.apiVersion]: apiVersion,
      [ngeHeaders.domain]: domain,
      [ngeHeaders.hmac]: hmac,
      [ngeHeaders.topic]: topic,
      [ngeHeaders.eventId]: eventId || webhookId,
      ...(handle && {[ngeHeaders.handle]: handle}),
      ...(action && {[ngeHeaders.action]: action}),
      ...(resourceId && {[ngeHeaders.resourceId]: resourceId}),
      ...(triggeredAt && {[ngeHeaders.triggeredAt]: triggeredAt}),
    };
  }

  // Current gen headers
  return {
    [lowercase
      ? ShopifyHeader.ApiVersion.toLowerCase()
      : ShopifyHeader.ApiVersion]: apiVersion,
    [lowercase ? ShopifyHeader.Domain.toLowerCase() : ShopifyHeader.Domain]:
      domain,
    [lowercase ? ShopifyHeader.Hmac.toLowerCase() : ShopifyHeader.Hmac]: hmac,
    [lowercase ? ShopifyHeader.Topic.toLowerCase() : ShopifyHeader.Topic]:
      topic,
    [lowercase
      ? ShopifyHeader.WebhookId.toLowerCase()
      : ShopifyHeader.WebhookId]: webhookId,
    ...(subTopic
      ? {
          [lowercase
            ? ShopifyHeader.SubTopic.toLowerCase()
            : ShopifyHeader.SubTopic]: subTopic,
        }
      : {}),
    ...(name && {[lowercase ? 'x-shopify-name' : 'X-Shopify-Name']: name}),
    ...(triggeredAt && {[lowercase ? 'x-shopify-triggered-at' : 'X-Shopify-Triggered-At']: triggeredAt}),
    ...(eventId && {[lowercase ? 'x-shopify-event-id' : 'X-Shopify-Event-Id']: eventId}),
  };
}
```

**Step 3: Run existing tests to verify no regression**

Run: `cd packages/apps/shopify-api && npm test -- --testPathPattern='webhooks/.*validate'`
Expected: All existing tests pass

**Step 4: Commit**

```bash
git add packages/apps/shopify-api/lib/webhooks/__tests__/utils.ts
git commit -m "test(webhooks): extend headers helper for NGE format"
```

---

## Task 4: Write Failing Tests for Webhook Type Detection

**Files:**
- Modify: `packages/apps/shopify-api/lib/webhooks/__tests__/validate.test.ts`

**Step 1: Add test cases for NGE webhook validation**

Add after the last `it` block (around line 105), before the closing `});` of the describe block:

```typescript
  describe('NGE webhook validation', () => {
    it('validates NGE webhooks with lowercase headers', async () => {
      const shopify = shopifyApi(testConfig());
      const app = getTestApp(shopify);

      const response = await request(app)
        .post('/webhooks')
        .set(headers({
          hmac: hmac(shopify.config.apiSecretKey, rawBody),
          webhookType: 'nge',
          topic: 'Product',
          action: 'create',
          handle: 'my-webhook',
          resourceId: 'gid://shopify/Product/123',
        }))
        .send(rawBody)
        .expect(200);

      expect(response.body.data).toMatchObject({
        valid: true,
        webhookType: 'nge',
        topic: 'Product',
        domain: 'shop1.myshopify.io',
        action: 'create',
        handle: 'my-webhook',
        resourceId: 'gid://shopify/Product/123',
      });
    });

    it('returns webhookType: current_gen for current gen webhooks', async () => {
      const shopify = shopifyApi(testConfig());
      const app = getTestApp(shopify);

      const response = await request(app)
        .post('/webhooks')
        .set(headers({hmac: hmac(shopify.config.apiSecretKey, rawBody)}))
        .send(rawBody)
        .expect(200);

      expect(response.body.data).toMatchObject({
        valid: true,
        webhookType: 'current_gen',
      });
    });

    it('extracts NGE-specific optional fields', async () => {
      const shopify = shopifyApi(testConfig());
      const app = getTestApp(shopify);

      const response = await request(app)
        .post('/webhooks')
        .set(headers({
          hmac: hmac(shopify.config.apiSecretKey, rawBody),
          webhookType: 'nge',
          handle: 'test-handle',
          action: 'update',
          resourceId: 'gid://shopify/Product/456',
          triggeredAt: '2026-01-27T12:00:00Z',
          eventId: 'event-123',
        }))
        .send(rawBody)
        .expect(200);

      expect(response.body.data).toMatchObject({
        valid: true,
        handle: 'test-handle',
        action: 'update',
        resourceId: 'gid://shopify/Product/456',
        triggeredAt: '2026-01-27T12:00:00Z',
        eventId: 'event-123',
      });
    });

    it('extracts current gen name field', async () => {
      const shopify = shopifyApi(testConfig());
      const app = getTestApp(shopify);

      const response = await request(app)
        .post('/webhooks')
        .set(headers({
          hmac: hmac(shopify.config.apiSecretKey, rawBody),
          name: 'my-webhook-name',
        }))
        .send(rawBody)
        .expect(200);

      expect(response.body.data).toMatchObject({
        valid: true,
        webhookType: 'current_gen',
        name: 'my-webhook-name',
      });
    });
  });

  describe('webhook type detection', () => {
    it('detects current_gen when X-Shopify-Hmac-Sha256 present', async () => {
      const shopify = shopifyApi(testConfig());
      const app = getTestApp(shopify);

      const response = await request(app)
        .post('/webhooks')
        .set(headers({hmac: hmac(shopify.config.apiSecretKey, rawBody)}))
        .send(rawBody)
        .expect(200);

      expect(response.body.data.webhookType).toBe('current_gen');
    });

    it('detects nge when shopify-hmac-sha256 present', async () => {
      const shopify = shopifyApi(testConfig());
      const app = getTestApp(shopify);

      const response = await request(app)
        .post('/webhooks')
        .set(headers({
          hmac: hmac(shopify.config.apiSecretKey, rawBody),
          webhookType: 'nge',
        }))
        .send(rawBody)
        .expect(200);

      expect(response.body.data.webhookType).toBe('nge');
    });
  });
```

**Step 2: Run tests to verify they fail**

Run: `cd packages/apps/shopify-api && npm test -- --testPathPattern='webhooks/.*validate'`
Expected: New tests FAIL (webhookType not yet implemented)

**Step 3: Commit failing tests**

```bash
git add packages/apps/shopify-api/lib/webhooks/__tests__/validate.test.ts
git commit -m "test(webhooks): add failing tests for NGE header support"
```

---

## Task 5: Update HMAC Validator for NGE Headers

**Files:**
- Modify: `packages/apps/shopify-api/lib/utils/hmac-validator.ts`

**Step 1: Add imports**

Add after line 13:
```typescript
import {WEBHOOK_HEADER_NAMES, WebhookTypeValue} from '../webhooks/header-names';
```

**Step 2: Update ValidateParams interface**

Replace the interface (lines 28-37) with:
```typescript
export interface ValidateParams extends AdapterArgs {
  /**
   * The type of validation to perform, either 'flow' or 'webhook'.
   */
  type: HmacValidationType;
  /**
   * The raw body of the request.
   */
  rawBody: string;
  /**
   * The webhook type for header selection (optional, only for webhooks).
   */
  webhookType?: WebhookTypeValue;
}
```

**Step 3: Update validateHmacFromRequestFactory**

Replace the function (lines 113-139) with:
```typescript
export function validateHmacFromRequestFactory(config: ConfigInterface) {
  return async function validateHmacFromRequest({
    type,
    rawBody,
    webhookType,
    ...adapterArgs
  }: ValidateParams): Promise<ValidationInvalid | ValidationValid> {
    const request = await abstractConvertRequest(adapterArgs);
    if (!rawBody.length) {
      return fail(ValidationErrorReason.MissingBody, type, config);
    }

    // Use appropriate header based on webhook type
    const hmacHeaderName = webhookType
      ? WEBHOOK_HEADER_NAMES[webhookType].hmac
      : ShopifyHeader.Hmac;

    const hmac = getHeader(request.headers, hmacHeaderName);
    if (!hmac) {
      return fail(ValidationErrorReason.MissingHmac, type, config);
    }
    const validHmac = await validateHmacString(
      config,
      rawBody,
      hmac,
      HashFormat.Base64,
    );
    if (!validHmac) {
      return fail(ValidationErrorReason.InvalidHmac, type, config);
    }

    return succeed(type, config);
  };
}
```

**Step 4: Verify types compile**

Run: `cd packages/apps/shopify-api && npx tsc --noEmit`
Expected: No errors

**Step 5: Commit**

```bash
git add packages/apps/shopify-api/lib/utils/hmac-validator.ts
git commit -m "feat(webhooks): update HMAC validator for NGE header support"
```

---

## Task 6: Implement Detection and Header Extraction

**Files:**
- Modify: `packages/apps/shopify-api/lib/webhooks/validate.ts`

**Step 1: Update imports**

Replace lines 1-21 with:
```typescript
import {logger} from '../logger';
import {validateHmacFromRequestFactory} from '../utils/hmac-validator';
import {HmacValidationType, ValidationErrorReason} from '../utils/types';
import {
  abstractConvertRequest,
  getHeader,
  Headers,
  NormalizedRequest,
} from '../../runtime/http';
import {ShopifyHeader} from '../types';
import {ConfigInterface} from '../base-types';

import {
  WebhookFields,
  WebhookValidateParams,
  WebhookValidation,
  WebhookValidationErrorReason,
  WebhookValidationMissingHeaders,
  WebhookValidationValid,
} from './types';
import {topicForStorage} from './registry';
import {
  WEBHOOK_HEADER_NAMES,
  WebhookType,
  WebhookTypeValue,
} from './header-names';
```

**Step 2: Add detection function**

Add after the imports (before OPTIONAL_HANDLER_PROPERTIES):
```typescript
function detectWebhookType(headers: Headers): WebhookTypeValue {
  // Check for current gen first (most common during rollout)
  const currentGenHmac = getHeader(
    headers,
    WEBHOOK_HEADER_NAMES[WebhookType.CurrentGen].hmac,
  );
  if (currentGenHmac) {
    return WebhookType.CurrentGen;
  }

  // Fall back to NGE
  const ngeHmac = getHeader(headers, WEBHOOK_HEADER_NAMES[WebhookType.NextGen].hmac);
  if (ngeHmac) {
    return WebhookType.NextGen;
  }

  // Default to current gen (will fail validation with missing_hmac)
  return WebhookType.CurrentGen;
}
```

**Step 3: Update validateFactory to use detection**

Replace the `validateFactory` function (lines 36-62) with:
```typescript
export function validateFactory(config: ConfigInterface) {
  return async function validate({
    rawBody,
    ...adapterArgs
  }: WebhookValidateParams): Promise<WebhookValidation> {
    const request: NormalizedRequest =
      await abstractConvertRequest(adapterArgs);

    // Step 0: Detect webhook type
    const webhookType = detectWebhookType(request.headers);

    // Step 1: Validate HMAC with type-aware header selection
    const validHmacResult = await validateHmacFromRequestFactory(config)({
      type: HmacValidationType.Webhook,
      rawBody,
      webhookType,
      ...adapterArgs,
    });

    if (!validHmacResult.valid) {
      if (validHmacResult.reason === ValidationErrorReason.InvalidHmac) {
        const log = logger(config);
        await log.debug(
          "Webhook HMAC validation failed. Please note that events manually triggered from a store's Notifications settings will fail this validation. To test this, please use the CLI or trigger the actual event in a development store.",
        );
      }
      return validHmacResult;
    }

    // Step 2: Extract headers with type-aware field extraction
    return checkWebhookHeaders(request.headers, webhookType);
  };
}
```

**Step 4: Update checkWebhookHeaders for type-aware extraction**

Replace the `checkWebhookHeaders` function and remove the old HANDLER_PROPERTIES constants. Replace everything from line 23 (the old OPTIONAL_HANDLER_PROPERTIES) through the end of checkWebhookHeaders with:

```typescript
function checkWebhookHeaders(
  headers: Headers,
  webhookType: WebhookTypeValue,
): WebhookValidationMissingHeaders | WebhookValidationValid {
  const headerNames = WEBHOOK_HEADER_NAMES[webhookType];
  const missingHeaders: string[] = [];

  // Required fields for both types
  const requiredFields: (keyof typeof headerNames)[] = [
    'hmac',
    'topic',
    'domain',
    'apiVersion',
  ];

  // webhookId is only required for current gen (NGE uses eventId)
  if (webhookType === WebhookType.CurrentGen) {
    requiredFields.push('webhookId');
  }

  const headerValues: Partial<WebhookFields> = {
    webhookType,
  };

  // Extract required fields
  for (const field of requiredFields) {
    const headerName = headerNames[field as keyof typeof headerNames];
    if (headerName) {
      const value = getHeader(headers, headerName);
      if (value) {
        (headerValues as any)[field] = value;
      } else {
        missingHeaders.push(headerName);
      }
    }
  }

  // Extract optional fields based on type
  if (webhookType === WebhookType.CurrentGen) {
    const currentGenHeaders = WEBHOOK_HEADER_NAMES[WebhookType.CurrentGen];

    const subTopic = getHeader(headers, currentGenHeaders.subTopic);
    if (subTopic) headerValues.subTopic = subTopic;

    const name = getHeader(headers, currentGenHeaders.name);
    if (name) headerValues.name = name;

    // For current gen, webhookId was already extracted as required
    // Also extract optional triggeredAt and eventId
    const triggeredAt = getHeader(headers, currentGenHeaders.triggeredAt);
    if (triggeredAt) headerValues.triggeredAt = triggeredAt;

    const eventId = getHeader(headers, currentGenHeaders.eventId);
    if (eventId) headerValues.eventId = eventId;
  } else {
    const ngeHeaders = WEBHOOK_HEADER_NAMES[WebhookType.NextGen];

    // NGE uses eventId as the primary identifier
    const eventId = getHeader(headers, ngeHeaders.eventId);
    if (eventId) {
      headerValues.eventId = eventId;
      headerValues.webhookId = eventId; // Map to webhookId for compatibility
    }

    const handle = getHeader(headers, ngeHeaders.handle);
    if (handle) headerValues.handle = handle;

    const action = getHeader(headers, ngeHeaders.action);
    if (action) headerValues.action = action;

    const resourceId = getHeader(headers, ngeHeaders.resourceId);
    if (resourceId) headerValues.resourceId = resourceId;

    const triggeredAt = getHeader(headers, ngeHeaders.triggeredAt);
    if (triggeredAt) headerValues.triggeredAt = triggeredAt;
  }

  if (missingHeaders.length) {
    return {
      valid: false,
      reason: WebhookValidationErrorReason.MissingHeaders,
      missingHeaders,
    };
  }

  return {
    valid: true,
    ...(headerValues as WebhookFields),
    topic: topicForStorage(headerValues.topic!),
  };
}
```

**Step 5: Run tests to verify they pass**

Run: `cd packages/apps/shopify-api && npm test -- --testPathPattern='webhooks/.*validate'`
Expected: All tests PASS

**Step 6: Commit**

```bash
git add packages/apps/shopify-api/lib/webhooks/validate.ts
git commit -m "feat(webhooks): implement NGE detection and header extraction"
```

---

## Task 7: Export Header Names from Package

**Files:**
- Modify: `packages/apps/shopify-api/lib/webhooks/index.ts`

**Step 1: Find and update the webhooks index file**

Add export for header-names:
```typescript
export * from './header-names';
```

**Step 2: Verify types compile**

Run: `cd packages/apps/shopify-api && npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add packages/apps/shopify-api/lib/webhooks/index.ts
git commit -m "feat(webhooks): export NGE header constants"
```

---

## Task 8: Update React Router WebhookContext Types

**Files:**
- Modify: `packages/apps/shopify-app-react-router/src/server/authenticate/webhooks/types.ts`

**Step 1: Add new optional fields to Context interface**

Add the following fields to the `Context` interface (after `subTopic?: string;` around line 133):

```typescript
  /**
   * The type of webhook: 'current_gen' for traditional webhooks or 'nge' for Next Generation Events.
   */
  webhookType?: 'current_gen' | 'nge';

  /**
   * The name assigned to the webhook subscription (current gen only).
   */
  name?: string;

  /**
   * The handle for the webhook subscription (NGE only).
   */
  handle?: string;

  /**
   * The action type: 'create', 'update', or 'delete' (NGE only).
   */
  action?: string;

  /**
   * The GID of the resource that triggered the webhook (NGE only).
   */
  resourceId?: string;

  /**
   * The timestamp when the webhook was triggered.
   */
  triggeredAt?: string;

  /**
   * The unique event identifier.
   */
  eventId?: string;
```

**Step 2: Verify types compile**

Run: `cd packages/apps/shopify-app-react-router && npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add packages/apps/shopify-app-react-router/src/server/authenticate/webhooks/types.ts
git commit -m "feat(react-router): add NGE fields to WebhookContext types"
```

---

## Task 9: Pass Through New Fields in React Router Authenticate

**Files:**
- Modify: `packages/apps/shopify-app-react-router/src/server/authenticate/webhooks/authenticate.ts`

**Step 1: Update the webhookContext object**

Replace lines 53-62 (the webhookContext creation) with:
```typescript
    const webhookContext: WebhookContextWithoutSession<Topics> = {
      apiVersion: check.apiVersion,
      shop: check.domain,
      topic: check.topic as Topics,
      webhookId: check.webhookId,
      payload: JSON.parse(rawBody),
      subTopic: check.subTopic || undefined,
      session: undefined,
      admin: undefined,
      // New NGE fields
      webhookType: check.webhookType,
      name: check.name,
      handle: check.handle,
      action: check.action,
      resourceId: check.resourceId,
      triggeredAt: check.triggeredAt,
      eventId: check.eventId,
    };
```

**Step 2: Verify types compile**

Run: `cd packages/apps/shopify-app-react-router && npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add packages/apps/shopify-app-react-router/src/server/authenticate/webhooks/authenticate.ts
git commit -m "feat(react-router): pass through NGE webhook fields"
```

---

## Task 10: Run Full Test Suite and Verify

**Step 1: Run all webhook tests in shopify-api**

Run: `cd packages/apps/shopify-api && npm test -- --testPathPattern='webhooks'`
Expected: All tests pass (56+ tests)

**Step 2: Run all tests in shopify-api**

Run: `cd packages/apps/shopify-api && npm test`
Expected: All tests pass (may have pre-existing failures unrelated to webhooks)

**Step 3: Run linting**

Run: `npm run lint -- --filter='@shopify/shopify-api' --filter='@shopify/shopify-app-react-router'`
Expected: No new lint errors

**Step 4: Final commit if any fixups needed**

```bash
git add -A
git commit -m "fix: address lint and test issues"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Add header name constants | `header-names.ts` (new) |
| 2 | Update WebhookFields type | `types.ts` |
| 3 | Extend test helper | `__tests__/utils.ts` |
| 4 | Write failing tests | `__tests__/validate.test.ts` |
| 5 | Update HMAC validator | `hmac-validator.ts` |
| 6 | Implement detection + extraction | `validate.ts` |
| 7 | Export header names | `webhooks/index.ts` |
| 8 | Update React Router types | `webhooks/types.ts` |
| 9 | Pass through fields | `webhooks/authenticate.ts` |
| 10 | Full test verification | — |

**Test command:** `cd packages/apps/shopify-api && npm test -- --testPathPattern='webhooks'`
