---
'@shopify/graphql-client': patch
---

Better error handling for missing Response.body in multipart requests. Instead of being "Cannot read properties of undefined (reading 'Symbol(Symbol.asyncIterator)')", it will now be the more useful and accurate message "API multipart response did not return an iterable body".
