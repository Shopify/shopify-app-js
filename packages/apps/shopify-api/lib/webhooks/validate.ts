import {logger} from '../logger';
import {validateHmacFromRequestFactory} from '../utils/hmac-validator';
import {HmacValidationType, ValidationErrorReason} from '../utils/types';
import {
  abstractConvertRequest,
  getHeader,
  Headers,
  NormalizedRequest,
} from '../../runtime/http';
import {ConfigInterface} from '../base-types';

import {
  EventsWebhookFields,
  WEBHOOK_HEADER_NAMES,
  WebhooksWebhookFields,
  WebhookType,
  WebhookTypeValue,
  WebhookValidateParams,
  WebhookValidation,
  WebhookValidationErrorReason,
  WebhookValidationMissingHeaders,
  WebhookValidationValid,
} from './types';
import {topicForStorage} from './registry';

function detectWebhookType(headers: Headers): WebhookTypeValue {
  const eventsHmac = getHeader(
    headers,
    WEBHOOK_HEADER_NAMES[WebhookType.Events].hmac,
  );
  if (eventsHmac) {
    return WebhookType.Events;
  }

  const webhooksHmac = getHeader(
    headers,
    WEBHOOK_HEADER_NAMES[WebhookType.Webhooks].hmac,
  );
  if (webhooksHmac) {
    return WebhookType.Webhooks;
  }

  return WebhookType.Webhooks;
}

export function validateFactory(config: ConfigInterface) {
  return async function validate({
    rawBody,
    ...adapterArgs
  }: WebhookValidateParams): Promise<WebhookValidation> {
    const request: NormalizedRequest =
      await abstractConvertRequest(adapterArgs);

    const webhookType = detectWebhookType(request.headers);

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

    return checkWebhookHeaders(request.headers, webhookType);
  };
}

function getRequiredHeader(
  headers: Headers,
  headerName: string,
  missingHeaders: string[],
): string | undefined {
  const value = getHeader(headers, headerName);
  if (!value) {
    missingHeaders.push(headerName);
  }
  return value;
}

function checkWebhookHeaders(
  headers: Headers,
  webhookType: WebhookTypeValue,
): WebhookValidationMissingHeaders | WebhookValidationValid {
  if (webhookType === WebhookType.Webhooks) {
    return checkWebhooksHeaders(headers);
  }
  return checkEventsHeaders(headers);
}

function checkWebhooksHeaders(
  headers: Headers,
): WebhookValidationMissingHeaders | WebhookValidationValid {
  const headerNames = WEBHOOK_HEADER_NAMES[WebhookType.Webhooks];
  const missingHeaders: string[] = [];

  const hmac = getRequiredHeader(headers, headerNames.hmac, missingHeaders);
  const topic = getRequiredHeader(headers, headerNames.topic, missingHeaders);
  const domain = getRequiredHeader(headers, headerNames.domain, missingHeaders);
  const apiVersion = getRequiredHeader(
    headers,
    headerNames.apiVersion,
    missingHeaders,
  );
  const webhookId = getRequiredHeader(
    headers,
    headerNames.webhookId,
    missingHeaders,
  );

  if (missingHeaders.length) {
    return {
      valid: false,
      reason: WebhookValidationErrorReason.MissingHeaders,
      missingHeaders,
    };
  }

  const fields: WebhooksWebhookFields = {
    webhookType: WebhookType.Webhooks,
    hmac: hmac!,
    topic: topicForStorage(topic!),
    domain: domain!,
    apiVersion: apiVersion!,
    webhookId: webhookId!,
  };

  const subTopic = getHeader(headers, headerNames.subTopic);
  if (subTopic) fields.subTopic = subTopic;

  const name = getHeader(headers, headerNames.name);
  if (name) fields.name = name;

  const triggeredAt = getHeader(headers, headerNames.triggeredAt);
  if (triggeredAt) fields.triggeredAt = triggeredAt;

  const eventId = getHeader(headers, headerNames.eventId);
  if (eventId) fields.eventId = eventId;

  return {valid: true, ...fields};
}

function checkEventsHeaders(
  headers: Headers,
): WebhookValidationMissingHeaders | WebhookValidationValid {
  const headerNames = WEBHOOK_HEADER_NAMES[WebhookType.Events];
  const missingHeaders: string[] = [];

  const hmac = getRequiredHeader(headers, headerNames.hmac, missingHeaders);
  const topic = getRequiredHeader(headers, headerNames.topic, missingHeaders);
  const domain = getRequiredHeader(headers, headerNames.domain, missingHeaders);
  const apiVersion = getRequiredHeader(
    headers,
    headerNames.apiVersion,
    missingHeaders,
  );
  const eventId = getRequiredHeader(
    headers,
    headerNames.eventId,
    missingHeaders,
  );

  if (missingHeaders.length) {
    return {
      valid: false,
      reason: WebhookValidationErrorReason.MissingHeaders,
      missingHeaders,
    };
  }

  const fields: EventsWebhookFields = {
    webhookType: WebhookType.Events,
    hmac: hmac!,
    topic: topicForStorage(topic!),
    domain: domain!,
    apiVersion: apiVersion!,
    eventId: eventId!,
  };

  const handle = getHeader(headers, headerNames.handle);
  if (handle) fields.handle = handle;

  const action = getHeader(headers, headerNames.action);
  if (action) fields.action = action;

  const resourceId = getHeader(headers, headerNames.resourceId);
  if (resourceId) fields.resourceId = resourceId;

  const triggeredAt = getHeader(headers, headerNames.triggeredAt);
  if (triggeredAt) fields.triggeredAt = triggeredAt;

  return {valid: true, ...fields};
}
