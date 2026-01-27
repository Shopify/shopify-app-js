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

function detectWebhookType(headers: Headers): WebhookTypeValue {
  // Check for webhooks first (most common during rollout)
  const webhooksHmac = getHeader(
    headers,
    WEBHOOK_HEADER_NAMES[WebhookType.Webhooks].hmac,
  );
  if (webhooksHmac) {
    return WebhookType.Webhooks;
  }

  // Fall back to NGE
  const ngeHmac = getHeader(headers, WEBHOOK_HEADER_NAMES[WebhookType.NextGen].hmac);
  if (ngeHmac) {
    return WebhookType.NextGen;
  }

  // Default to webhooks (will fail validation with missing_hmac)
  return WebhookType.Webhooks;
}

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

function checkWebhookHeaders(
  headers: Headers,
  webhookType: WebhookTypeValue,
): WebhookValidationMissingHeaders | WebhookValidationValid {
  const headerNames = WEBHOOK_HEADER_NAMES[webhookType];
  const missingHeaders: string[] = [];

  // Required fields for both types (common fields)
  const requiredFields: string[] = ['hmac', 'topic', 'domain', 'apiVersion'];

  // webhookId is only required for webhooks (NGE uses eventId)
  if (webhookType === WebhookType.Webhooks) {
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
  if (webhookType === WebhookType.Webhooks) {
    const webhooksHeaders = WEBHOOK_HEADER_NAMES[WebhookType.Webhooks];

    const subTopic = getHeader(headers, webhooksHeaders.subTopic);
    if (subTopic) headerValues.subTopic = subTopic;

    const name = getHeader(headers, webhooksHeaders.name);
    if (name) headerValues.name = name;

    // For webhooks, webhookId was already extracted as required
    // Also extract optional triggeredAt and eventId
    const triggeredAt = getHeader(headers, webhooksHeaders.triggeredAt);
    if (triggeredAt) headerValues.triggeredAt = triggeredAt;

    const eventId = getHeader(headers, webhooksHeaders.eventId);
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

  // For webhooks, normalize topic for storage. For NGE, keep as-is since format differs.
  const topic =
    webhookType === WebhookType.Webhooks
      ? topicForStorage(headerValues.topic!)
      : headerValues.topic!;

  return {
    valid: true,
    ...(headerValues as WebhookFields),
    topic,
  };
}
