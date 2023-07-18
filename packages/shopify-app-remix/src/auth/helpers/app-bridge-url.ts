import {APP_BRIDGE_URL} from '../const';

let appBridgeUrlOverride: string | undefined;
export function setAppBridgeUrlOverride(url: string) {
  appBridgeUrlOverride = url;
}

export function appBridgeUrl() {
  return appBridgeUrlOverride || APP_BRIDGE_URL;
}
