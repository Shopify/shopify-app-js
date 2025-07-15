---
'@shopify/graphql-client': patch
---

Fix error handling for JSON parse failures in GraphQL responses.

When a server returns non-JSON content (e.g., HTML error pages, malformed JSON), the client now properly handles the parsing error and includes the response object and status code in the error details. This prevents uncaught promise rejections and provides better debugging information.