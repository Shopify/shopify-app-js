---
'@shopify/shopify-app-session-storage-redis': patch
---

Update `redis` to ^6.3.0 while preserving RESP2 and unbounded command queue wait for adapter-created clients. Explicit client options still override these defaults. Continue accepting supplied `redis` v5 and v6 clients without changing their protocol or queue-wait policy.
