import {isbot} from 'isbot';

import type {BasicParams} from '../../types';

const SHOPIFY_POS_USER_AGENT = /Shopify POS\//;
const SHOPIFY_MOBILE_USER_AGENT = /Shopify Mobile\//;

const SHOPIFY_USER_AGENTS = [SHOPIFY_POS_USER_AGENT, SHOPIFY_MOBILE_USER_AGENT];

export function respondToBotRequest(
  {logger}: BasicParams,
  request: Request,
): void | never {
  const userAgent = request.headers.get('User-Agent') ?? '';

  // We call isbot below to prevent good (self-identifying) bots from triggering auth requests, but there are some
  // Shopify-specific cases we want to allow that are identified as bots by isbot.
  if (SHOPIFY_USER_AGENTS.some((agent) => agent.test(userAgent))) {
    logger.debug('Request is from a Shopify agent, allow');
    return;
  }

  if (isbot(userAgent)) {
    logger.debug('Request is from a bot, skipping auth');
    throw new Response(undefined, {status: 410, statusText: 'Gone'});
  }
}
