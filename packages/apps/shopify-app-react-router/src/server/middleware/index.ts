/**
 * Middleware infrastructure for shopify-app-react-router
 *
 * This module provides React Router v7 middleware support for Shopify app authentication
 * and authorization, offering a more idiomatic alternative to the authenticate pattern.
 */

export * from './types';
export * from './contexts';
export * from './auth';
export * from './billing-required';
export * from './webhook';
export * from './flow';
export * from './factory';

// Future exports will include:
// export * from './scopes-required';
// export * from './checkout';
// export * from './app-proxy';
// export * from './customer-account';
// export * from './flow';
// export * from './fulfillment';
// export * from './pos';
// export * from './cors';
