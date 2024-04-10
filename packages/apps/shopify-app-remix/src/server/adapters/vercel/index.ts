import {setAbstractFetchFunc} from '@shopify/shopify-api/runtime';
import {installGlobals} from '@remix-run/node';

import '../node';

installGlobals();

const fetchFunc = fetch;
setAbstractFetchFunc(async (...args) => {
  const response = await fetchFunc(...args);

  return response as any;
});
