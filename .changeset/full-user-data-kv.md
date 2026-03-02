---
'@shopify/shopify-app-session-storage-kv': minor
---

Store full online access user data (firstName, lastName, email, accountOwner, locale, collaborator, emailVerified) instead of only a numeric user ID. Previously the adapter serialised online session user info as a single opaque value containing just the user ID, silently discarding all other user fields. Sessions now round-trip the complete user object.

No schema migration is required — Cloudflare Workers KV is schema-less. Existing online sessions stored with the old format will continue to load correctly; their `userId` is preserved and all other user fields will be populated on the user's next authentication.
