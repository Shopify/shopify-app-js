// Store request init objects for testing purposes
export const mockRequestCapture = {
  lastRequestInit: undefined as globalThis.RequestInit | undefined,
  reset() {
    this.lastRequestInit = undefined;
  },
};
