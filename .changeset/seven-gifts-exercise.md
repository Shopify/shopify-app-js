---
'@shopify/shopify-app-remix': minor
---

# Function to authenticate POS UI extension requests

A new API had been added to the `authenticate` module to authenticate POS UI extension requests.

The `authenticate.public.pos` function is now available to authenticate POS UI extension requests.

It returns the session token that was sent with the request and a `cors` function to ensure your app can respond to POS UI extension requests.

```ts
//app/routes/pos.jsx
import { authenticate } from "../shopify.server";
export const action = async ({ request }) => {

        const {sessionToken } = await authenticate.public.pos(request);
        console.log(sessionToken, "sessionToken");

    return "hello world"
}

// extensions/pos-ui/src/Modal.jsx
import React, { useEffect, useState } from 'react'

import { Text, Screen, ScrollView, Navigator, reactExtension, useApi } from '@shopify/ui-extensions-react/point-of-sale'

const Modal = () => {
  const api = useApi()
  const {getSessionToken} = api.session;
  const [token, setToken] = useState('');
  const [result, setResult] = useState('');

  useEffect(() => {
    const fetchToken = async () => {
      const newToken = await getSessionToken();
      setToken(newToken);
      await fetchWithToken(newToken);
    };

    async function fetchWithToken(token) {
      const result = await fetch(
        'https://decor-plasma-showtimes-beverages.trycloudflare.com/pos',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({}) // Add your POST data here
        },
      );
      const resultJson = await result.json();
      setResult(resultJson);
    }

   fetchToken();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <Navigator>
      <Screen name="HelloWorld" title="Hello World!">
        <ScrollView>
          <Text>Welcome to the extension</Text>
          <Text> The result is: {JSON.stringify(result)}</Text>
        </ScrollView>
      </Screen>
    </Navigator>
  )
}

export default reactExtension('pos.home.modal.render', () => <Modal />);
```
