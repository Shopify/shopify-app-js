import {spawn} from 'child_process';

import {TestConfig, E2eTestEnvironment} from './test_config_types';
import {runEnvironments, shutdownEnvironments} from './test_environments';
import {testSuite} from './test_suite';
import {nodeLocalhostFetch} from './node-localhost-fetch';

export type {E2eTestEnvironment} from './test_config_types';

export function runTests(env: E2eTestEnvironment) {
  const dummyShopifyServerEnvironment = {
    name: 'Dummy Shopify server',
    domain: `http://localhost:${env.dummyServerPort}`,
    dummyServerPort: 'not actually used',

    process: spawn('node', ['bundle/test-dummy-shopify-server.mjs'], {
      env: {
        ...process.env, // eslint-disable-line no-process-env
        HTTP_SERVER_PORT: env.dummyServerPort,
      },
      detached: true,
      stdio: process.env.SHOPIFY_E2E_TEST_DEBUG ? 'inherit' : undefined, // eslint-disable-line no-process-env
      cwd: `${__dirname}/../..`,
    }),
    testable: false,
    ready: false,
  };

  const testEnvironments = [env, dummyShopifyServerEnvironment];

  describe(`${env.name}`, () => {
    beforeAll(async () => {
      await runEnvironments(testEnvironments);
    });

    afterAll(() => {
      shutdownEnvironments(testEnvironments);
    });

    testSuite.forEach((test) => {
      it(test.name, async () => {
        await checkTestResponse(
          env.name === 'NodeJS'
            ? await nodeLocalhostFetch(env.domain, fetchParams(test.config))
            : await fetch(env.domain, fetchParams(test.config)),
        );
      });
    });
  });
}

function fetchParams(testConfig: TestConfig): any {
  return {
    method: 'post',
    body: JSON.stringify(testConfig),
    headers: {'Content-Type': 'application/json'},
  };
}

async function checkTestResponse(response: any): Promise<void> {
  try {
    expect(response.status).toEqual(200);
  } catch (err) {
    const responseBody = await response.json();
    err.message = `TEST FAILED - debug from appServer: ${JSON.stringify(
      responseBody,
      undefined,
      2,
    )}\n${responseBody.errorMessageReceived}`;
    throw err;
  }
}
