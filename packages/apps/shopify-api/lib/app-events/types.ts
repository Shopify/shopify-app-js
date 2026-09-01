// Mirrors GlobalApi::App::EventParams. Documented at
// https://shopify.dev/docs/api/app-events/latest/creating-events
export const MAX_IDEMPOTENCY_KEY_LENGTH = 64;
export const MAX_ATTRIBUTE_KEYS = 15;
export const MAX_ATTRIBUTE_KEY_LENGTH = 64;
export const MAX_ATTRIBUTE_STRING_VALUE_LENGTH = 128;
export const MAX_TIMESTAMP_FUTURE_MS = 300_000;
export const ATTRIBUTE_KEY_PATTERN = /^[a-zA-Z0-9_.-]+$/;

export type AppEventAttributeValue = string | number | boolean;

export interface AppEventInput {
  /** Numeric shop id or `gid://shopify/Shop/{id}`. */
  shopId: string | number | bigint;
  eventHandle: string;
  idempotencyKey: string;
  /**
   * Event data. The App Events API requires this field, so pass `{}` when the
   * event carries no data. Keys with an `undefined` value are dropped.
   */
  attributes: Record<string, AppEventAttributeValue | undefined>;
  /** Defaults to now. Must not be more than 5 minutes in the future. */
  timestamp?: Date;
}

export interface AppEventLogResult {
  /** True when Shopify replayed a cached response for this idempotency key. */
  replayed: boolean;
}

export type AppEventLog = (event: AppEventInput) => Promise<AppEventLogResult>;

/** Snake_case wire payload. Root keys must match the server contract exactly. */
export interface AppEventPayload {
  shop_id: string;
  event_handle: string;
  timestamp: string;
  idempotency_key: string;
  attributes: Record<string, AppEventAttributeValue>;
}
