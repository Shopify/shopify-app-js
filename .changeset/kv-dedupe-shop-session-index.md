---
'@shopify/shopify-app-session-storage-kv': patch
---

Stop adding duplicate session ids to the `shop:<shop>` index when an existing session is stored again (for example on every expiring offline token refresh). Indexes that already contain duplicates are compacted on the next store, and `findSessionsByShop` loads each session only once.
