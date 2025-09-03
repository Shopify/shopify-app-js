import {setAbstractFetchFunc} from '../../../../runtime';
import {nodeLocalhostFetch} from '../../node-localhost-fetch';

// Use the adapter the package provides
import '../../../node';

// Override the fetch function with one that handles localhost requests differently
// See the implementation of nodeLocalhostFetch for details
setAbstractFetchFunc(nodeLocalhostFetch as any);
