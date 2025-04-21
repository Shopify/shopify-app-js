#!/usr/bin/env node

/**
 * Quick fix script for the shopify-app-router package
 * This fixes the ESM compatibility issue in the node adapter
 */
const fs = require('fs');
const path = require('path');

// Path to the node adapter file in node_modules
const NODE_ADAPTER_PATH = path.resolve('./node_modules/@shopify/shopify-app-router/dist/esm/server/adapters/node/index.mjs');

// Check if file exists
if (!fs.existsSync(NODE_ADAPTER_PATH)) {
  console.error(`File not found: ${NODE_ADAPTER_PATH}`);
  console.error('Make sure @shopify/shopify-app-router is installed');
  process.exit(1);
}

// Correct ESM content for the node adapter
const FIXED_CONTENT = `
import crypto from 'crypto';
import { setCrypto, setAbstractRuntimeString } from '@shopify/shopify-api/runtime';
import { setAppBridgeUrlOverride } from '../../authenticate/helpers/app-bridge-url.mjs';

setCrypto(crypto);
setAbstractRuntimeString(() => {
  return \`Remix (Node)\`;
});
/* eslint-disable no-process-env */
if (process.env.APP_BRIDGE_URL) {
  setAppBridgeUrlOverride(process.env.APP_BRIDGE_URL);
}
/* eslint-enable no-process-env */
//# sourceMappingURL=index.mjs.map
`;

try {
  // Write the fixed content
  fs.writeFileSync(NODE_ADAPTER_PATH, FIXED_CONTENT, 'utf8');
  console.log('✅ Successfully fixed the shopify-app-router node adapter!');
} catch (error) {
  console.error('Error fixing the file:', error);
  process.exit(1);
} 