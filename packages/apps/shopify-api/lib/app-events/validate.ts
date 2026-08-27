import {InvalidAppEventError} from '../error';

import {
  AppEventAttributeValue,
  AppEventInput,
  AppEventPayload,
  ATTRIBUTE_KEY_PATTERN,
  MAX_ATTRIBUTE_KEY_LENGTH,
  MAX_ATTRIBUTE_KEYS,
  MAX_ATTRIBUTE_STRING_VALUE_LENGTH,
  MAX_IDEMPOTENCY_KEY_LENGTH,
} from './types';

const SHOP_GID_PATTERN = /^gid:\/\/shopify\/Shop\/(\d+)$/;
const NUMERIC_SHOP_ID_PATTERN = /^\d+$/;

export function validateAppEvent(event: AppEventInput): AppEventPayload {
  if (event === null || typeof event !== 'object' || Array.isArray(event)) {
    throw new InvalidAppEventError('event must be a non-null object');
  }

  let shopId: string;
  if (
    typeof event.shopId === 'string' ||
    typeof event.shopId === 'number' ||
    typeof event.shopId === 'bigint'
  ) {
    shopId = String(event.shopId);
  } else {
    throw new InvalidAppEventError(
      'shopId must be a numeric shop ID or gid://shopify/Shop/{id}',
    );
  }

  const shopGidMatch = shopId.match(SHOP_GID_PATTERN);
  if (shopGidMatch) {
    shopId = shopGidMatch[1];
  } else if (!NUMERIC_SHOP_ID_PATTERN.test(shopId)) {
    throw new InvalidAppEventError(
      'shopId must be a numeric shop ID or gid://shopify/Shop/{id}',
    );
  }

  if (
    typeof event.eventHandle !== 'string' ||
    event.eventHandle.trim().length === 0
  ) {
    throw new InvalidAppEventError('eventHandle must be a non-empty string');
  }
  const eventHandle = event.eventHandle;

  if (
    typeof event.idempotencyKey !== 'string' ||
    event.idempotencyKey.trim().length === 0
  ) {
    throw new InvalidAppEventError('idempotencyKey must be a non-empty string');
  }
  if (Array.from(event.idempotencyKey).length > MAX_IDEMPOTENCY_KEY_LENGTH) {
    throw new InvalidAppEventError(
      `idempotencyKey must not exceed ${MAX_IDEMPOTENCY_KEY_LENGTH} characters`,
    );
  }

  const timestamp =
    event.timestamp === undefined ? new Date() : event.timestamp;
  if (!(timestamp instanceof Date) || Number.isNaN(timestamp.getTime())) {
    throw new InvalidAppEventError('timestamp must be a valid Date');
  }
  if (timestamp.getTime() > Date.now() + 300_000) {
    throw new InvalidAppEventError(
      'timestamp must not be more than 300 seconds in the future',
    );
  }

  if (event.attributes === undefined) {
    throw new InvalidAppEventError(
      'attributes is required; pass {} when the event carries no data',
    );
  }
  if (
    event.attributes === null ||
    typeof event.attributes !== 'object' ||
    Array.isArray(event.attributes)
  ) {
    throw new InvalidAppEventError(
      'attributes must be a non-null object, not an array',
    );
  }

  const entries = Object.entries(event.attributes).filter(
    (entry): entry is [string, AppEventAttributeValue] =>
      entry[1] !== undefined,
  );

  if (entries.length > MAX_ATTRIBUTE_KEYS) {
    throw new InvalidAppEventError(
      `attributes must not contain more than ${MAX_ATTRIBUTE_KEYS} keys`,
    );
  }

  const attributes: Record<string, AppEventAttributeValue> = {};
  for (const [key, value] of entries) {
    if (key.length > MAX_ATTRIBUTE_KEY_LENGTH) {
      throw new InvalidAppEventError(
        `attribute key "${key}" must not exceed ${MAX_ATTRIBUTE_KEY_LENGTH} characters`,
      );
    }
    if (!ATTRIBUTE_KEY_PATTERN.test(key)) {
      throw new InvalidAppEventError(
        `attribute key "${key}" may contain only letters, numbers, underscores, periods, and hyphens`,
      );
    }
    if (
      typeof value !== 'string' &&
      typeof value !== 'number' &&
      typeof value !== 'boolean'
    ) {
      throw new InvalidAppEventError(
        `attribute "${key}" must be a string, number, or boolean`,
      );
    }
    if (typeof value === 'number' && !Number.isFinite(value)) {
      throw new InvalidAppEventError(
        `attribute "${key}" must be a finite number`,
      );
    }
    if (
      typeof value === 'string' &&
      Array.from(value).length > MAX_ATTRIBUTE_STRING_VALUE_LENGTH
    ) {
      throw new InvalidAppEventError(
        `attribute "${key}" must not exceed ${MAX_ATTRIBUTE_STRING_VALUE_LENGTH} characters`,
      );
    }

    attributes[key] = value;
  }

  return {
    shop_id: shopId,
    event_handle: eventHandle,
    timestamp: timestamp.toISOString(),
    idempotency_key: event.idempotencyKey,
    attributes,
  };
}
