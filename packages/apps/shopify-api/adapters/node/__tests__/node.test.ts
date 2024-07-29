import {spawn} from 'child_process';

import '..';

import '../../../runtime/__tests__/all.test';
import {runTests, E2eTestEnvironment} from '../../__e2etests__/e2e-runner.test';

const nodeAppPort = '6666';
const dummyServerPort = '6667';

const nodeEnvironment: E2eTestEnvironment = {
  name: 'NodeJS',
  domain: `http://localhost:${nodeAppPort}`,
  dummyServerPort,
  process: spawn('yarn', ['node', 'bundle/test-node-app.mjs'], {
    env: {
      ...process.env, // eslint-disable-line no-process-env
      PORT: nodeAppPort,
      HTTP_SERVER_PORT: dummyServerPort,
    },
    detached: true,
    // stdio: 'inherit',
  }),
  testable: true,
  ready: false,
};

runTests(nodeEnvironment);
