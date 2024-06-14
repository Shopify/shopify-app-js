import crypto from 'crypto';

import {API_SECRET_KEY} from '../test-helpers/const';

export function getHmac(body: string): string {
  return crypto
    .createHmac('sha256', API_SECRET_KEY)
    .update(body, 'utf8')
    .digest('base64');
}
