const shopify = shopifyApp({
    apiKey: "your-api-key",
    apiSecretKey: "your-api-secret-key",
    adminApiAccessToken:"shpat_1234567890",
    distribution: AppDistribution.ShopifyAdmin,
    appUrl: "https://localhost:3000",
    isEmbeddedApp: false,
    ...
}
