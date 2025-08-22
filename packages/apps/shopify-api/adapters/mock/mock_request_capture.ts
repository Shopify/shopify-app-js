import {RequestInit} from 'node-fetch';

// Store request init objects for testing purposes
export const mockRequestCapture = {
  lastRequestInit: undefined as RequestInit | undefined,
  reset() {
    this.lastRequestInit = undefined;
  },
};
