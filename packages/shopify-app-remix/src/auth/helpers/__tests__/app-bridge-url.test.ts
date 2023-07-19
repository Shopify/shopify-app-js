import {APP_BRIDGE_URL} from '../../const';
import {appBridgeUrl, setAppBridgeUrlOverride} from '../app-bridge-url';

describe('appBridgeUrl', () => {
  it('defaults to returning the const APP_BRIDGE_URL', () => {
    // GIVEN
    setAppBridgeUrlOverride(undefined as any as string);

    // THEN
    expect(appBridgeUrl()).toEqual(APP_BRIDGE_URL);
  });

  it('returns the override value when set', () => {
    // GIVEN
    const override = 'http://localhost:9876/app-bridge.js';
    setAppBridgeUrlOverride(override);

    // THEN
    expect(appBridgeUrl()).toEqual(override);
  });
});
