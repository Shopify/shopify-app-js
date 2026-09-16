import {shopifyApi} from '../..';
import {testConfig} from '../../__tests__/test-config';
import {InvalidAppEventError} from '../../error';

import {AppEventInput} from '../types';
import {validateAppEvent} from '../validate';

const config = shopifyApi(testConfig()).config;

function validEvent(overrides: Partial<AppEventInput> = {}): AppEventInput {
  return {
    myshopifyDomain: 'test-shop.myshopify.io',
    eventHandle: 'onboarding_completed',
    idempotencyKey: 'onboard_23423423_v3',
    attributes: {},
    timestamp: new Date('2026-01-27T14:30:00.000Z'),
    ...overrides,
  };
}

describe('validateAppEvent', () => {
  test('sends the myshopify domain', () => {
    const payload = validateAppEvent(config, validEvent());

    expect(payload.myshopify_domain).toBe('test-shop.myshopify.io');
  });

  test('normalizes an admin URL to the myshopify domain', () => {
    const payload = validateAppEvent(
      config,
      validEvent({myshopifyDomain: 'admin.shopify.com/store/test-shop'}),
    );

    expect(payload.myshopify_domain).toBe('test-shop.myshopify.com');
  });

  test('rejects a numeric shop ID', () => {
    expect(() =>
      validateAppEvent(config, validEvent({myshopifyDomain: '23423423'})),
    ).toThrow(InvalidAppEventError);
  });
  test('rejects a non-string myshopifyDomain', () => {
    expect(() =>
      validateAppEvent(
        config,
        validEvent({myshopifyDomain: 23423423 as unknown as string}),
      ),
    ).toThrow(InvalidAppEventError);
  });

  test('defaults an omitted timestamp to the current time', () => {
    const before = Date.now();
    const payload = validateAppEvent(config, {
      myshopifyDomain: 'test-shop.myshopify.io',
      eventHandle: 'onboarding_completed',
      idempotencyKey: 'onboard_23423423_v3',
      attributes: {},
    });

    expect(new Date(payload.timestamp).getTime()).toBeWithinSecondsOf(before, 1);
  });

  test('accepts 15 attributes and rejects 16', () => {
    const fifteenAttributes = Object.fromEntries(
      Array.from({length: 15}, (_, index) => [`key${index}`, index]),
    );
    const sixteenAttributes = {...fifteenAttributes, key15: 15};

    expect(
      validateAppEvent(config, validEvent({attributes: fifteenAttributes})).attributes,
    ).toEqual(fifteenAttributes);
    expect(() =>
      validateAppEvent(config, validEvent({attributes: sixteenAttributes})),
    ).toThrow(InvalidAppEventError);
  });

  test('rejects an attribute key with spaces', () => {
    expect(() =>
      validateAppEvent(config, validEvent({attributes: {'bad key': 'value'}})),
    ).toThrow(InvalidAppEventError);
  });

  test('rejects an attribute key longer than 64 characters', () => {
    expect(() =>
      validateAppEvent(config, validEvent({attributes: {['a'.repeat(65)]: 'value'}})),
    ).toThrow(InvalidAppEventError);
  });

  test('rejects a string attribute value longer than 128 characters', () => {
    expect(() =>
      validateAppEvent(config, validEvent({attributes: {key: 'a'.repeat(129)}})),
    ).toThrow(InvalidAppEventError);
  });

  test('rejects null attribute values and drops undefined ones', () => {
    const eventWithNullAttribute = validEvent();
    Object.assign(eventWithNullAttribute, {attributes: {a: null}});
    expect(() => validateAppEvent(config, eventWithNullAttribute)).toThrow(
      InvalidAppEventError,
    );

    const payload = validateAppEvent(config, validEvent({attributes: {a: undefined}}));
    expect(payload.attributes).toEqual({});
  });

  test('sends an empty attributes object rather than omitting the field', () => {
    const payload = validateAppEvent(config, validEvent({attributes: {}}));

    expect(payload.attributes).toEqual({});
  });

  test('preserves the __proto__ attribute in the payload', () => {
    const attributes = JSON.parse('{"__proto__":"value"}') as Record<string, string>;
    const payload = validateAppEvent(config, validEvent({attributes}));

    expect(JSON.stringify(payload.attributes)).toBe('{"__proto__":"value"}');
  });

  test('rejects omitted attributes', () => {
    const event = validEvent();
    delete (event as Partial<AppEventInput>).attributes;

    expect(() => validateAppEvent(config, event)).toThrow(InvalidAppEventError);
  });

  test('rejects an idempotency key longer than 64 characters', () => {
    expect(() =>
      validateAppEvent(config, validEvent({idempotencyKey: 'a'.repeat(65)})),
    ).toThrow(InvalidAppEventError);
  });

  test('rejects null, primitive, and array event containers', () => {
    expect(() => validateAppEvent(config, null as never)).toThrow(InvalidAppEventError);
    expect(() => validateAppEvent(config, 'event' as never)).toThrow(InvalidAppEventError);
    expect(() => validateAppEvent(config, [] as never)).toThrow(InvalidAppEventError);
  });

  test('rejects null, primitive, and array attribute containers', () => {
    expect(() =>
      validateAppEvent(config, validEvent({attributes: null as never})),
    ).toThrow(InvalidAppEventError);
    expect(() =>
      validateAppEvent(config, validEvent({attributes: 'attributes' as never})),
    ).toThrow(InvalidAppEventError);
    expect(() =>
      validateAppEvent(config, validEvent({attributes: [] as never})),
    ).toThrow(InvalidAppEventError);
  });

  test('rejects a null or future timestamp', () => {
    expect(() =>
      validateAppEvent(config, validEvent({timestamp: null as never})),
    ).toThrow(InvalidAppEventError);
    expect(() =>
      validateAppEvent(config, validEvent({timestamp: new Date(Date.now() + 301_000)})),
    ).toThrow(InvalidAppEventError);
  });

  test('preserves surrounding whitespace in a nonblank event handle', () => {
    const payload = validateAppEvent(
      config,
      validEvent({eventHandle: '  onboarding_completed  '}),
    );

    expect(payload.event_handle).toBe('  onboarding_completed  ');
  });

  test('rejects non-finite numeric attribute values', () => {
    expect(() =>
      validateAppEvent(config, validEvent({attributes: {value: NaN}})),
    ).toThrow(InvalidAppEventError);
    expect(() =>
      validateAppEvent(config, validEvent({attributes: {value: Infinity}})),
    ).toThrow(InvalidAppEventError);
  });

  test('counts Unicode code points for idempotency keys and string attributes', () => {
    expect(
      validateAppEvent(
        config,
        validEvent({
          idempotencyKey: '😀'.repeat(64),
          attributes: {value: '😀'.repeat(128)},
        }),
      ),
    ).toMatchObject({
      idempotency_key: '😀'.repeat(64),
      attributes: {value: '😀'.repeat(128)},
    });
    expect(() =>
      validateAppEvent(config, validEvent({idempotencyKey: '😀'.repeat(65)})),
    ).toThrow(InvalidAppEventError);
    expect(() =>
      validateAppEvent(config, validEvent({attributes: {value: '😀'.repeat(129)}})),
    ).toThrow(InvalidAppEventError);
  });
});
