import crypto from 'crypto';

export function getHmac(body: string, apiSecretKey: string): string {
  return crypto
    .createHmac('sha256', apiSecretKey)
    .update(body, 'utf8')
    .digest('base64');
}
