# shopify.clients.Graphql

Instances of this class can make requests to the Shopify Admin GraphQL API.

> **Note**: You can use the [Shopify Admin API GraphiQL explorer](https://shopify.dev/docs/apps/tools/graphiql-admin-api) to help build your queries.

## Constructor

### Example

```ts
// Requests to /my-endpoint must include a valid session token in the Authorization header added by App Bridge
// https://shopify.dev/docs/apps/build/authentication-authorization/set-embedded-app-authorization?extension=javascript#authentication
app.get('/my-endpoint', async () => {
  const sessionId = await shopify.session.getCurrentId({
    isOnline: true,
    rawRequest: req,
    rawResponse: res,
  });

  // use sessionId to retrieve session from app's session storage
  // getSessionFromStorage() must be provided by application
  const session = await getSessionFromStorage(sessionId);

  const client = new shopify.clients.Graphql({
    session,
    apiVersion: ApiVersion.January23,
  });
});
```

### Parameters

Receives an object containing:

#### session

`Session` | :exclamation: required

The Shopify Session containing an access token to the API.

#### apiVersion

`ApiVersion`

This will override the default API version.
Any requests made by this client will reach this version instead.

## Request

Sends a request to the Admin API.

### Examples

#### Using a query string

```ts
const response = await client.request(
  `{
    products (first: 10) {
      edges {
        node {
          id
          title
          descriptionHtml
        }
      }
    }
  }`,
);
console.log(response.data, response.extensions);
```

#### Using variables

```ts
const response = await client.request(
  `query GetProducts($first: Int!) {
    products (first: $first) {
      edges {
        node {
          id
          title
          descriptionHtml
        }
      }
    }
  }`,
  {
    variables: {
      first: 10,
    },
  },
);
console.log(response.data, response.extensions, response.headers);
```

#### Using a type argument

If using TypeScript, you can pass in a type argument for the response body:

```ts
// If using TypeScript, you can type the response body
interface MyResponseBodyType {
  data: {
    //...
  };
}

const response = await client.request<MyResponseBodyType>(/* ... */);

// response.body will be of type MyResponseBodyType
console.log(response.body.data);
```

#### Handling errors

If there are any errors in the response, `request` will throw a `GraphqlQueryError` which includes details from the API response:

```ts
import {GraphqlQueryError} from '@shopify/shopify-api';

try {
  const products = await client.request(/* ... */);

  // No errors, proceed with logic
} catch (error) {
  if (error instanceof GraphqlQueryError) {
    // look at the GraphQL errors returned from the API response
    error.body?.errors.graphQLErrors
    // Also, error.headers contains the headers of the response received from Shopify
  } else {
    // handle other errors
  }
}
```

#### Setting a timeout
You can set a timeout for the request by passing in a signal with an AbortController. If the request takes longer than the timeout, it will be aborted and an AbortError will be thrown.

```ts
const response = await client.request(
  `query GetProducts($first: Int!) {
    products (first: $first) {
      edges {
        node {
          id
          title
          descriptionHtml
        }
      }
    }
  }`,
  {
    variables: {
      first: 10,
    },
    signal: AbortSignal.timeout(3000), // 3 seconds
  },
);
```

### Parameters

#### operation

`string` | :exclamation: required

The query or mutation string.

#### options.variables

`{[key: string]: any}`

The variables for the operation.

#### options.headers

`{[key: string]: string | number}`

Add custom headers to the request.

#### options.retries

`number` | _Must be between_ `0 and 3`

The maximum number of times to retry the request.

#### options.signal

`AbortSignal`

An optional AbortSignal to cancel the request.

### Return

`Promise<GraphQLClientResponse>`

Returns an object containing:

#### Data

`any`

The [`data` component](https://shopify.dev/docs/api/admin/getting-started#graphql-admin-api) of the response.

#### Extensions

`any`

The [`extensions` component](https://shopify.dev/docs/api/admin-graphql#rate_limits) of the response.

#### Headers
`Record<string, string | string[]>`
The headers from the response.

[Back to shopify.clients](./README.md)
