import {redirectToAuth} from '../redirect-to-auth';

import {AuthBeginParams} from './types';

export async function authBegin({req, res, api, config}: AuthBeginParams) {
  await redirectToAuth({req, res, api, config});
}
