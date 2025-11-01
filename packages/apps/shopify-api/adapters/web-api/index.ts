import {
  setAbstractFetchFunc,
  setAbstractConvertRequestFunc,
  setAbstractConvertResponseFunc,
  setAbstractConvertHeadersFunc,
  setAbstractRuntimeString,
} from '../../runtime';

import {
  webApiConvertHeaders,
  webApiConvertRequest,
  webApiConvertResponse,
  webApiRuntimeString,
} from './adapter';

setAbstractFetchFunc(fetch);
setAbstractConvertRequestFunc(webApiConvertRequest);
setAbstractConvertResponseFunc(webApiConvertResponse);
setAbstractConvertHeadersFunc(webApiConvertHeaders);
setAbstractRuntimeString(webApiRuntimeString);

// Export a marker to prevent tree-shaking
export const webApiAdapterInitialized = true;