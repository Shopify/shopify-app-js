import {logger} from '../logger';
import {ShopifyHeader} from '../types';
import {
  AdapterArgs,
  abstractConvertRequest,
  getHeader,
} from '../../runtime/http';
import {ConfigInterface} from '../base-types';
import {createSHA256HMAC} from '../../runtime/crypto';
import {HashFormat} from '../../runtime/crypto/types';
import {AuthQuery} from '../auth/oauth/types';
import * as ShopifyErrors from '../error';
import {safeCompare} from '../auth/oauth/safe-compare';
import {WEBHOOK_HEADER_NAMES, WebhookTypeValue} from '../webhooks/types';

import ProcessedQuery from './processed-query';
import {
  ValidationErrorReason,
  ValidationInvalid,
  HmacValidationType,
  ValidationValid,
  ValidationErrorReasonType,
} from './types';

const HMAC_TIMESTAMP_PERMITTED_CLOCK_TOLERANCE_SEC = 90;
const APP_PROXY_SINGLE_VALUE_PARAMS = new Set([
  'hmac',
  'shop',
  'signature',
  'timestamp',
]);

export type HMACSignator = 'admin' | 'appProxy';
type HmacQuery = AuthQuery | URLSearchParams;

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

function stringifyQueryForAdmin(query: AuthQuery): string {
  const processedQuery = new ProcessedQuery();
  Object.keys(query)
    .sort((val1, val2) => val1.localeCompare(val2))
    .forEach((key: string) => processedQuery.put(key, query[key]));

  return processedQuery.stringify(true);
}

function stringifyQueryForAppProxy(query: AuthQuery): string {
  return Object.entries(query)
    .sort(([val1], [val2]) => val1.localeCompare(val2))
    .reduce((acc, [key, value]) => {
      return `${acc}${key}=${Array.isArray(value) ? value.join(',') : value}`;
    }, '');
}

export function generateLocalHmac(config: ConfigInterface) {
  return async (
    params: AuthQuery,
    signator: HMACSignator = 'admin',
  ): Promise<string> => {
    const {hmac: _hmac, signature: _signature, ...query} = params;

    const queryString =
      signator === 'admin'
        ? stringifyQueryForAdmin(query)
        : stringifyQueryForAppProxy(query);

    return createSHA256HMAC(config.apiSecretKey, queryString, HashFormat.Hex);
  };
}

export function validateHmac(config: ConfigInterface) {
  return async (
    query: HmacQuery,
    {signator}: {signator: HMACSignator} = {signator: 'admin'},
  ): Promise<boolean> => {
    const normalizedQuery = normalizeQuery(query, signator);

    if (signator === 'admin' && !normalizedQuery.hmac) {
      throw new ShopifyErrors.InvalidHmacError(
        'Query does not contain an HMAC value.',
      );
    }

    if (signator === 'appProxy' && !normalizedQuery.signature) {
      throw new ShopifyErrors.InvalidHmacError(
        'Query does not contain a signature value.',
      );
    }

    validateHmacTimestamp(normalizedQuery);

    const hmac =
      signator === 'appProxy'
        ? normalizedQuery.signature
        : normalizedQuery.hmac;
    const localHmac = await generateLocalHmac(config)(
      normalizedQuery,
      signator,
    );

    return safeCompare(hmac as string, localHmac);
  };
}

function normalizeQuery(query: HmacQuery, signator: HMACSignator): AuthQuery {
  if (!(query instanceof URLSearchParams)) {
    if (signator === 'appProxy') {
      for (const key of APP_PROXY_SINGLE_VALUE_PARAMS) {
        if (Array.isArray(query[key])) {
          throw new ShopifyErrors.InvalidHmacError(
            `Query parameter "${key}" must not appear more than once.`,
          );
        }
      }
    }

    return query;
  }

  const normalizedQuery = Object.create(null) as AuthQuery;
  for (const [key, value] of query.entries()) {
    const existingValue = normalizedQuery[key];
    if (existingValue === undefined) {
      normalizedQuery[key] = value;
    } else if (
      signator === 'appProxy' &&
      APP_PROXY_SINGLE_VALUE_PARAMS.has(key)
    ) {
      throw new ShopifyErrors.InvalidHmacError(
        `Query parameter "${key}" must not appear more than once.`,
      );
    } else {
      normalizedQuery[key] = `${existingValue},${value}`;
    }
  }

  return normalizedQuery;
}

export async function validateHmacString(
  config: ConfigInterface,
  data: string,
  hmac: string,
  format: HashFormat,
) {
  const localHmac = await createSHA256HMAC(config.apiSecretKey, data, format);

  return safeCompare(hmac, localHmac);
}

export function getCurrentTimeInSec() {
  return Math.trunc(Date.now() / 1000);
}

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

function validateHmacTimestamp(query: AuthQuery) {
  const {timestamp} = query;

  if (
    timestamp === undefined ||
    timestamp === null ||
    Array.isArray(timestamp)
  ) {
    throw new ShopifyErrors.InvalidHmacError(
      'HMAC timestamp is missing or invalid',
    );
  }

  const parsedTimestamp = Number(timestamp);

  if (!Number.isInteger(parsedTimestamp)) {
    throw new ShopifyErrors.InvalidHmacError(
      'HMAC timestamp is missing or invalid',
    );
  }

  if (
    Math.abs(getCurrentTimeInSec() - parsedTimestamp) >
    HMAC_TIMESTAMP_PERMITTED_CLOCK_TOLERANCE_SEC
  ) {
    throw new ShopifyErrors.InvalidHmacError(
      'HMAC timestamp is outside of the tolerance range',
    );
  }
}

async function fail(
  reason: ValidationErrorReasonType,
  type: HmacValidationType,
  config: ConfigInterface,
): Promise<ValidationInvalid> {
  const log = logger(config);
  await log.debug(`${type} request is not valid`, {reason});

  return {
    valid: false,
    reason,
  };
}

async function succeed(
  type: HmacValidationType,
  config: ConfigInterface,
): Promise<ValidationValid> {
  const log = logger(config);
  await log.debug(`${type} request is valid`);

  return {
    valid: true,
  };
}
