// ... imports
const shopify = shopifyApp({
  // .. and the rest of the config
  isEmbeddedApp: true,
  future: {
    unstable_newEmbeddedAuthStrategy: true,
  },
)};

// ... exports
