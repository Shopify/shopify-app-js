import {
  setAbstractFetchFunc,
  setAbstractConvertRequestFunc,
  setAbstractConvertIncomingResponseFunc,
  setAbstractConvertResponseFunc,
  setAbstractConvertHeadersFunc,
  setAbstractRuntimeString,
} from '../../runtime';

import {
  nodeConvertRequest,
  nodeConvertIncomingResponse,
  nodeConvertAndSendResponse,
  nodeConvertAndSetHeaders,
  nodeRuntimeString,
} from './adapter';

// For the purposes of this package, fetch correctly implements everything we need
setAbstractFetchFunc(globalThis.fetch);
setAbstractConvertRequestFunc(nodeConvertRequest);
setAbstractConvertIncomingResponseFunc(nodeConvertIncomingResponse);
setAbstractConvertResponseFunc(nodeConvertAndSendResponse);
setAbstractConvertHeadersFunc(nodeConvertAndSetHeaders);
setAbstractRuntimeString(nodeRuntimeString);

// Export a marker to prevent tree-shaking
export const nodeAdapterInitialized = true;
