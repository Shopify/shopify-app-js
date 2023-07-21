import {appBridgeUrl} from '../../../server/auth/helpers/app-bridge-url';
import {APP_BRIDGE_URL} from '../../../server/auth/const';

describe('node setup import', () => {
  /* eslint-disable no-process-env */
  it('overwrites the App Bridge URL from the env var when present', async () => {
    // GIVEN
    expect(appBridgeUrl()).toEqual(APP_BRIDGE_URL);
    process.env.APP_BRIDGE_URL = 'http://localhost:9876/app-bridge.js';

    // WHEN
    await require('../index');

    // THEN
    expect(appBridgeUrl()).toEqual(process.env.APP_BRIDGE_URL);
  });
  /* eslint-enable no-process-env */
});
