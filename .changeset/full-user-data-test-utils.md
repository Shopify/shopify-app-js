---
'@shopify/shopify-app-session-storage-test-utils': major
---

The `testUserInfo` parameter of `batteryOfTests` now defaults to `true`. All maintained session storage adapters now correctly store and round-trip the full online access user object, so user info testing is part of the standard battery. Third-party adapters that do not yet support user info fields will need to pass `false` explicitly to opt out, or update their schema to pass the test.
