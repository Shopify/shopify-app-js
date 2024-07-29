[webhooks]
api_version = "2024-04"

  [[webhooks.subscriptions]]
  topics = [ "app/uninstalled" ]
  uri = "/webhooks"
  compliance_topics = [ "customers/data_request", "customers/redact", "shop/redact" ]
