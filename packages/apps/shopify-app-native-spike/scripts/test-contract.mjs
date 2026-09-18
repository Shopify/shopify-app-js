import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {createServer} from 'node:http';
import {cp, mkdir, mkdtemp, readFile, rm, symlink, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve} from 'node:path';

const source = process.env.SHOPIFY_APP_PACKAGES_SOURCE;
if (!source) throw new Error('Set SHOPIFY_APP_PACKAGES_SOURCE to a Shopify App Packages checkout with its test dependencies installed.');
const files = [
  'test/suites/exchange-using-token-exchange.ts',
  'test/utils/rpc.ts', 'test/utils/jwt.ts', 'test/setup/matchers.ts', 'test/types.ts',
];
const suiteHash = '2c769763da175a94931233694541faada0350dc05a149872c691c8070d0f0ebd';
const suite = await readFile(resolve(source, files[0]));
assert.equal(createHash('sha256').update(suite).digest('hex'), suiteHash, 'Shared suite changed; review the contract before updating the pinned hash.');
const core = await import('../dist/esm/index.mjs');
const root = await mkdtemp(resolve(tmpdir(), 'underpin-contract-'));
let queue = Promise.resolve();
const server = createServer((req, res) => {
  if (req.method !== 'POST' || req.url !== '/rpc') {res.writeHead(404).end(); return;}
  let text = '';
  req.on('data', chunk => {text += chunk;});
  req.on('end', () => {
    queue = queue.then(async () => {
      let rpc;
      try {
        rpc = JSON.parse(text);
        assert.equal(rpc.function.method, 'exchangeUsingTokenExchange');
        const mocks = [...(rpc.mockShopifyApiResponses ?? [])];
        const fetch = async (url, options) => {
          assert.equal(url, 'https://test-shop.myshopify.com/admin/oauth/access_token');
          assert.equal(options.method, 'POST');
          const body = JSON.parse(options.body);
          assert.equal(body.client_id, rpc.config.clientId);
          assert.equal(body.client_secret, rpc.config.clientSecret);
          assert.equal(body.subject_token, rpc.function.namedParams.idToken.token);
          const mock = mocks.shift();
          assert.ok(mock, 'Unexpected HTTP request');
          if (mock.throwError) throw new TypeError(mock.throwError);
          return new Response(new TextEncoder().encode(mock.body ?? ''), {status: mock.status, headers: mock.headers});
        };
        const result = await core.exchangeUsingTokenExchange(rpc.config, rpc.function.namedParams, fetch);
        assert.equal(mocks.length, 0, 'Unconsumed HTTP response');
        res.writeHead(200, {'Content-Type': 'application/json'}).end(JSON.stringify({jsonrpc:'2.0', result, id:rpc.id}));
      } catch (error) {
        res.writeHead(200, {'Content-Type': 'application/json'}).end(JSON.stringify({jsonrpc:'2.0', error:{code:-32000, message:error.message}, id:rpc?.id}));
      }
    });
  });
});
try {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  for (const file of files) {
    const destination = resolve(root, file);
    await mkdir(resolve(destination, '..'), {recursive:true});
    await cp(resolve(source, file), destination);
  }
  await symlink(resolve(source, 'node_modules'), resolve(root, 'node_modules'));
  await writeFile(resolve(root, 'package.json'), JSON.stringify({private:true, type:'module'}));
  await writeFile(resolve(root, 'test/const.ts'), `
    export const SHOP = 'test-shop';
    export const SHOP_DOMAIN = SHOP + '.myshopify.com';
    export const CLIENT_ID = 'test-client-id';
    export const CLIENT_SECRET = 'test-client-secret-padding-extra';
    export const OLD_CLIENT_SECRET = 'old-test-client-secret-padding!!';
    export const ACCESS_TOKEN = 'shpat_test_token_123';
    export const languages = [{name:'JavaScript', directory:'.', startCommand:[], port:${port},
      transform:{argument:obj=>obj, result:obj=>obj},
      assertResultFormat(obj) { for (const key of Object.keys(obj)) { if(key.includes('_')) throw new Error('Expected camelCase result'); } },
      userAgent:'shopify-app-native-spike'}];
  `);
  await writeFile(resolve(root, 'test/exchange.test.ts'), `
    import {createExchangeUsingTokenExchangeTestSuite} from './suites/exchange-using-token-exchange.js';
    createExchangeUsingTokenExchangeTestSuite({methodName:'exchangeUsingTokenExchange'});
  `);
  await writeFile(resolve(root, 'vitest.config.ts'), `
    import {defineConfig} from 'vitest/config';
    export default defineConfig({test:{include:['test/exchange.test.ts'],setupFiles:['test/setup/matchers.ts'],testTimeout:15000,fileParallelism:false}});
  `);
  console.log(`Running unchanged shared suite SHA256 ${suiteHash}`);
  const child = spawn(resolve(root, 'node_modules/.bin/vitest'), ['run', '--config', resolve(root, 'vitest.config.ts')], {cwd:root, stdio:'inherit'});
  process.exitCode = await new Promise((resolve, reject) => {child.on('error', reject); child.on('exit', code => resolve(code ?? 1));});
} finally {
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
  if (process.env.KEEP_CONTRACT_HARNESS) console.log(`Harness retained: ${root}`);
  else await rm(root, {recursive:true, force:true});
}
