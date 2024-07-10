import crypto from 'crypto';

export function getHmac(body: string, apiSecret: string): string {
  return crypto
    .createHmac('sha256', apiSecret)
    .update(body, 'utf8')
    .digest('base64');
}
