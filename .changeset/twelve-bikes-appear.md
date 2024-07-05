---
'@shopify/shopify-app-remix': minor
---

# Add Admin path parsing to redirect

You can now pass in an admin path to the redirect function to redirect to a page in the Shopify Admin. This uses the same syntax App Bridge uses to [redirect](https://shopify.dev/docs/api/app-bridge-library/apis/navigation#example-navigating-to-pages-in-the-shopify-admin) to the Shopify Admin.

```ts
export const action = async ({request}: ActionFunctionArgs) => {
  const {redirect} = await authenticate.admin(request);

  return  redirect(`shopify://admin/products/123456`, { target: '_top' })
}
```
