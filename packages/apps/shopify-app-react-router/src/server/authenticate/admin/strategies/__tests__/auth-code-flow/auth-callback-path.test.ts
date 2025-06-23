// import {HashFormat, createSHA256HMAC} from '@shopify/shopify-api/runtime';

// import {shopifyApp} from '../../../../..';
// import {
//   BASE64_HOST,
//   TEST_SHOP,
//   getThrownResponse,
//   signRequestCookie,
//   testConfig,
//   mockExternalRequest,
//   APP_URL,
//   SHOPIFY_HOST,
// } from '../../../../../__test-helpers';

// describe('authorize.admin auth callback path', () => {
//   describe('when embedded app', () => {
//     describe('errors', () => {
//       test('throws an error if the shop param is missing', async () => {
//         // GIVEN
//         const config = testConfig();
//         const shopify = shopifyApp(config);

//         // WHEN
//         const response = await getThrownResponse(
//           shopify.authenticate.admin,
//           new Request(getCallbackUrl(config)),
//         );

//         // THEN
//         expect(response.status).toBe(400);
//         expect(await response.text()).toBe('Shop param is invalid');
//       });

//       test('throws an error if the shop param is not valid', async () => {
//         // GIVEN
//         const config = testConfig();
//         const shopify = shopifyApp(config);

//         // WHEN
//         const response = await getThrownResponse(
//           shopify.authenticate.admin,
//           new Request(`${getCallbackUrl(config)}?shop=invalid`),
//         );

//         // THEN
//         expect(response.status).toBe(400);
//         expect(await response.text()).toBe('Shop param is invalid');
//       });

//       test('throws an 302 Response to begin auth if CookieNotFound error', async () => {
//         // GIVEN
//         const config = testConfig();
//         const shopify = shopifyApp(config);

//         // WHEN
//         const callbackUrl = getCallbackUrl(config);
//         const response = await getThrownResponse(
//           shopify.authenticate.admin,
//           new Request(`${callbackUrl}?shop=${TEST_SHOP}`),
//         );

//         // THEN
//         const {searchParams, hostname} = new URL(
//           response.headers.get('location')!,
//         );

//         expect(response.status).toBe(302);
//         expect(hostname).toBe(TEST_SHOP);
//         expect(searchParams.get('client_id')).toBe(config.apiKey);
//         expect(searchParams.get('scope')).toBe(config.scopes!.toString());
//         expect(searchParams.get('redirect_uri')).toBe(callbackUrl);
//         expect(searchParams.get('state')).toStrictEqual(expect.any(String));
//       });

//       test('throws a 400 if there is no HMAC param', async () => {
//         // GIVEN
//         const config = testConfig();
//         const shopify = shopifyApp(config);

//         // WHEN
//         const state = 'nonce';
//         const request = new Request(
//           `${getCallbackUrl(config)}?shop=${TEST_SHOP}&state=${state}`,
//         );

//         signRequestCookie({
//           request,
//           cookieName: 'shopify_app_state',
//           cookieValue: state,
//         });

//         const response = await getThrownResponse(
//           shopify.authenticate.admin,
//           request,
//         );

//         // THEN
//         expect(response.status).toBe(400);
//         expect(response.statusText).toBe('Invalid OAuth Request');
//       });

//       test('throws a 400 if the HMAC param is invalid', async () => {
//         // GIVEN
//         const config = testConfig();
//         const shopify = shopifyApp(config);

//         // WHEN
//         const state = 'nonce';
//         const request = new Request(
//           `${getCallbackUrl(
//             config,
//           )}?shop=${TEST_SHOP}&state=${state}&hmac=invalid`,
//         );

//         signRequestCookie({
//           request,
//           cookieName: 'shopify_app_state',
//           cookieValue: state,
//         });

//         const response = await getThrownResponse(
//           shopify.authenticate.admin,
//           request,
//         );

//         // THEN
//         expect(response.status).toBe(400);
//       });

//       test('throws a 500 if any other errors are thrown', async () => {
//         // GIVEN
//         const config = testConfig();
//         const shopify = shopifyApp({
//           ...config,
//           hooks: {
//             afterAuth: () => {
//               throw new Error('test');
//             },
//           },
//         });

//         // WHEN
//         await mockCodeExchangeRequest('offline');
//         const response = await getThrownResponse(
//           shopify.authenticate.admin,
//           await getValidCallbackRequest(config),
//         );

//         // THEN
//         expect(response.status).toBe(500);
//       });
//     });

//     describe('Success states', () => {
//       test('Exchanges the code for a token and saves it to SessionStorage', async () => {
//         // GIVEN
//         const config = testConfig();
//         const shopify = shopifyApp(config);

//         // WHEN
//         await mockCodeExchangeRequest('offline');
//         await getThrownResponse(
//           shopify.authenticate.admin,
//           await getValidCallbackRequest(config),
//         );

//         // THEN
//         const [session] =
//           await config.sessionStorage!.findSessionsByShop(TEST_SHOP);

//         expect(session).toMatchObject({
//           accessToken: '123abc',
//           id: `offline_${TEST_SHOP}`,
//           isOnline: false,
//           scope: 'read_products',
//           shop: TEST_SHOP,
//           state: 'nonce',
//         });
//       });

//       test('throws an 302 Response to begin auth if token was offline and useOnlineTokens is true', async () => {
//         // GIVEN
//         const config = testConfig({
//           useOnlineTokens: true,
//         });
//         const shopify = shopifyApp(config);

//         // WHEN
//         await mockCodeExchangeRequest('offline');
//         const response = await getThrownResponse(
//           shopify.authenticate.admin,
//           await getValidCallbackRequest(config),
//         );

//         // THEN
//         const {searchParams, hostname} = new URL(
//           response.headers.get('location')!,
//         );

//         expect(response.status).toBe(302);
//         expect(hostname).toBe(TEST_SHOP);
//         expect(searchParams.get('client_id')).toBe(config.apiKey);
//         expect(searchParams.get('scope')).toBe(config.scopes!.toString());
//         expect(searchParams.get('redirect_uri')).toBe(getCallbackUrl(config));
//         expect(searchParams.get('state')).toStrictEqual(expect.any(String));
//       });

//       test('Does not throw a 302 Response to begin auth if token was online', async () => {
//         // GIVEN
//         const config = testConfig({
//           useOnlineTokens: true,
//         });
//         const shopify = shopifyApp(config);

//         // WHEN
//         await mockCodeExchangeRequest('online');
//         const response = await getThrownResponse(
//           shopify.authenticate.admin,
//           await getValidCallbackRequest(config),
//         );

//         // THEN
//         const base = `http://${APP_URL}`;
//         const {hostname} = new URL(response.headers.get('location')!, base);
//         expect(hostname).not.toBe(TEST_SHOP);
//       });

//       test('Runs the afterAuth hooks passing', async () => {
//         // GIVEN
//         const afterAuthMock = jest.fn();
//         const config = testConfig({
//           hooks: {
//             afterAuth: afterAuthMock,
//           },
//         });
//         const shopify = shopifyApp(config);

//         // WHEN
//         await mockCodeExchangeRequest();
//         await getThrownResponse(
//           shopify.authenticate.admin,
//           await getValidCallbackRequest(config),
//         );

//         // THEN
//         expect(afterAuthMock).toHaveBeenCalledTimes(1);
//       });

//       test('throws a 302 response to the embedded app URL', async () => {
//         // GIVEN
//         const config = testConfig({
//           future: {unstable_newEmbeddedAuthStrategy: false},
//         });
//         const shopify = shopifyApp(config);

//         // WHEN
//         await mockCodeExchangeRequest('offline');
//         const response = await getThrownResponse(
//           shopify.authenticate.admin,
//           await getValidCallbackRequest(config),
//         );

//         // THEN
//         expect(response.status).toBe(302);
//         expect(response.headers.get('location')).toBe(
//           `https://${SHOPIFY_HOST}/apps/testApiKey`,
//         );
//       });

//       test('throws a response if afterAuth hook throws a response', async () => {
//         // GIVEN
//         const redirectResponse = new Response(null, {status: 302});
//         const config = testConfig({
//           hooks: {
//             afterAuth: () => {
//               throw redirectResponse;
//             },
//           },
//         });
//         const shopify = shopifyApp(config);

//         // WHEN
//         await mockCodeExchangeRequest();
//         const response = await getThrownResponse(
//           shopify.authenticate.admin,
//           await getValidCallbackRequest(config),
//         );

//         // THEN
//         expect(response).toBe(redirectResponse);
//       });
//     });
//   });
// });

// function getCallbackUrl(appConfig: ReturnType<typeof testConfig>) {
//   return `${appConfig.appUrl}/auth/callback`;
// }

// async function getValidCallbackRequest(config: ReturnType<typeof testConfig>) {
//   const cookieName = 'shopify_app_state';
//   const state = 'nonce';
//   const code = 'code_from_shopify';
//   const now = Math.trunc(Date.now() / 1000) - 2;
//   const queryParams = `code=${code}&host=${BASE64_HOST}&shop=${TEST_SHOP}&state=${state}&timestamp=${now}`;
//   const hmac = await createSHA256HMAC(
//     config.apiSecretKey,
//     queryParams,
//     HashFormat.Hex,
//   );

//   const request = new Request(
//     `${getCallbackUrl(config)}?${queryParams}&hmac=${hmac}`,
//   );

//   signRequestCookie({
//     request,
//     cookieName,
//     cookieValue: state,
//   });

//   return request;
// }

// async function mockCodeExchangeRequest(
//   tokenType: 'online' | 'offline' = 'offline',
// ) {
//   const responseBody = {
//     access_token: '123abc',
//     scope: 'read_products',
//   };

//   await mockExternalRequest({
//     request: new Request(`https://${TEST_SHOP}/admin/oauth/access_token`, {
//       method: 'POST',
//     }),
//     response:
//       tokenType === 'offline'
//         ? new Response(JSON.stringify(responseBody))
//         : new Response(
//             JSON.stringify({
//               ...responseBody,
//               expires_in: Math.trunc(Date.now() / 1000) + 3600,
//               associated_user_scope: 'read_products',
//               associated_user: {
//                 id: 902541635,
//                 first_name: 'John',
//                 last_name: 'Smith',
//                 email: 'john@example.com',
//                 email_verified: true,
//                 account_owner: true,
//                 locale: 'en',
//                 collaborator: false,
//               },
//             }),
//           ),
//   });
// }
