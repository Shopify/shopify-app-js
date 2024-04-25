---
"@shopify/shopify-api": major
---

Webhook validation will now return a different `reason` value when the HMAC value is missing from the request. Instead of returning `WebhookValidationErrorReason.MissingHeaders` as it does for the other headers it validates, it will now return a new `WebhookValidationErrorReason.MissingHmac` error so this check matches other HMAC validations.

If your app doesn't explicitly check for the error after calling `webhook.validate()`, you don't need to make any changes.
