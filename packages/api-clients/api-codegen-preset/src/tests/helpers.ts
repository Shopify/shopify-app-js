export function getExpectedSchema(type: string, versioned: boolean) {
  return type === 'customer'
    ? [
        {
          [`https://app.myshopify.com/services/graphql/introspection/customer?api_client_api_key=test${versioned ? '&api_version=2023-10' : ''}`]:
            {
              method: 'GET',
            },
        },
      ]
    : `https://shopify.dev/${type}-graphql-direct-proxy${versioned ? '/2023-10' : ''}`;
}
