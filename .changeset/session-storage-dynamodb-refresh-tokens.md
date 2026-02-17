---
'@shopify/shopify-app-session-storage-dynamodb': patch
---

Add test coverage for refresh token storage using the centralized batteryOfTests suite. DynamoDB storage already supports refresh tokens automatically (it stores the complete Session object), so this change only adds explicit test verification.

**Note**: This is a test-only change. No code changes or migrations required. DynamoDB's flexible schema automatically handles the new optional fields.
