---
'@shopify/shopify-app-remix': minor
---

Adding a new `redirect` helper to the AdminContext type, which will be able to redirect to the given URL regardless of where an embedded app request is being served.

You can also use it to redirect to an external page out of the Shopify Admin by using the `target` option.

```ts
export const loader = async ({request}) => {
  const {redirect} = await authenticate.admin(request);

  return redirect('https://www.example.com', {target: '_top'});
};
```
