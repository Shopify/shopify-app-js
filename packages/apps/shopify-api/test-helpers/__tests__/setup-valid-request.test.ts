import {
  RequestType,
  setUpValidRequest,
  ValidRequestOptions,
} from '../setup-valid-request';
import {
  API_KEY,
  API_SECRET_KEY,
  APP_URL,
  BASE64_HOST,
  TEST_SHOP,
  TEST_SHOP_NAME,
} from '../const';
import {getHmac} from '../get-hmac';

let request: Request;
let options: ValidRequestOptions;

describe('setUpValidRequest', () => {
  beforeEach(() => {
    request = new Request(APP_URL);
  });

  it('can create an admin request', async () => {
    options = {
      type: RequestType.Admin,
      store: TEST_SHOP_NAME,
      apiKey: API_KEY,
      apiSecretKey: API_SECRET_KEY,
    };

    const authorizedRequest = await setUpValidRequest(options, request);
    const authorizedUrl = new URL(authorizedRequest.url);
    const embedded = authorizedUrl.searchParams.get('embedded');
    const shop = authorizedUrl.searchParams.get('shop');
    const host = authorizedUrl.searchParams.get('host');
    const token = authorizedUrl.searchParams.get('id_token');

    expect(embedded).toEqual('1');
    expect(shop).toEqual(TEST_SHOP);
    expect(host).toEqual(BASE64_HOST);
    expect(token?.length).toBeGreaterThan(0);
  });

  it('can create a bearer request', async () => {
    options = {
      type: RequestType.Bearer,
      store: TEST_SHOP_NAME,
      apiKey: API_KEY,
      apiSecretKey: API_SECRET_KEY,
    };

    const authorizedRequest = await setUpValidRequest(options, request);
    const authorizationHeader = authorizedRequest.headers.get('authorization');
    const token = authorizationHeader?.match(/^Bearer (.+)$/);

    expect(token?.length).toBeGreaterThan(0);
  });

  it('bearer requests preserve headers', async () => {
    options = {
      type: RequestType.Bearer,
      store: TEST_SHOP_NAME,
      apiKey: API_KEY,
      apiSecretKey: API_SECRET_KEY,
    };

    request.headers.set('preserved-header', 'preserved header value');

    const authorizedRequest = await setUpValidRequest(options, request);
    const preservedHeader = authorizedRequest.headers.get('preserved-header');

    expect(preservedHeader).toBe('preserved header value');
  });

  it('can create an extension request', async () => {
    options = {
      type: RequestType.Extension,
      store: TEST_SHOP_NAME,
      apiSecretKey: API_SECRET_KEY,
      body: 'test',
      headers: {
        'test-header': 'test value',
      },
    };
    const bodyString = JSON.stringify(options.body);
    const hmac = getHmac(bodyString, options.apiSecretKey);

    const authorizedRequest = await setUpValidRequest(options, request);
    const hmacHeader = authorizedRequest.headers.get('X-Shopify-Hmac-Sha256');
    const shopHeader = authorizedRequest.headers.get('X-Shopify-Shop-Domain');
    const testHeader = authorizedRequest.headers.get('test-header');
    const requestBody = await authorizedRequest.json();

    expect(hmacHeader).toEqual(hmac);
    expect(shopHeader).toEqual(TEST_SHOP);
    expect(testHeader).toEqual('test value');
    expect(requestBody).toEqual('test');
  });

  it('extension requests preserve headers', async () => {
    options = {
      type: RequestType.Extension,
      store: TEST_SHOP_NAME,
      apiSecretKey: API_SECRET_KEY,
      body: 'test',
    };

    request.headers.set('preserved-header', 'preserved header value');

    const authorizedRequest = await setUpValidRequest(options, request);
    const preservedHeader = authorizedRequest.headers.get('preserved-header');

    expect(preservedHeader).toBe('preserved header value');
  });

  it('can create a public request', async () => {
    options = {
      type: RequestType.Public,
      store: TEST_SHOP_NAME,
      apiSecretKey: API_SECRET_KEY,
    };

    const authorizedRequest = await setUpValidRequest(options, request);
    const authorizedUrl = new URL(authorizedRequest.url);
    const shop = authorizedUrl.searchParams.get('shop');
    const timestamp = authorizedUrl.searchParams.get('timestamp');
    const signature = authorizedUrl.searchParams.get('signature');

    expect(shop).toEqual(TEST_SHOP);
    expect(timestamp?.length).toBeGreaterThan(0);
    expect(signature?.length).toBeGreaterThan(0);
  });
});
