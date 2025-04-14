import {setAbstractFetchFunc} from '@shopify/shopify-api/runtime';

import '../node';

const fetchFunc = fetch;
setAbstractFetchFunc(async (...args) => {
  const response = await fetchFunc(...args);

  return response as any;
});
