import {Session} from '@shopify/shopify-api';

const expiryDate = new Date();
expiryDate.setMilliseconds(0);
expiryDate.setMinutes(expiryDate.getMinutes() + 60);

const testScopes = ['test_scope'];

export const v1_0_0SessionData = [
  new Session({
    id: 'abcde-12345',
    shop: 'shop1.myshopify.com',
    state: 'state',
    isOnline: false,
    scope: testScopes.toString(),
    accessToken: 'abcde-12345-123',
  }),
  new Session({
    id: 'abcde-67890',
    shop: 'shop1.myshopify.com',
    state: 'state',
    isOnline: true,
    expires: expiryDate,
    onlineAccessInfo: {associated_user: {id: 67890}} as any,
    scope: testScopes.toString(),
    accessToken: 'abcde-67890-678',
  }),
  new Session({
    id: 'vwxyz-12345',
    shop: 'shop2.myshopify.com',
    state: 'state',
    isOnline: false,
    scope: testScopes.toString(),
    accessToken: 'vwxyz-12345-123',
  }),
  new Session({
    id: 'vwxyz-67890',
    shop: 'shop2.myshopify.com',
    state: 'state',
    isOnline: true,
    expires: expiryDate,
    onlineAccessInfo: {associated_user: {id: 67890}} as any,
    scope: testScopes.toString(),
    accessToken: 'vwxyz-67890-678',
  }),
];
