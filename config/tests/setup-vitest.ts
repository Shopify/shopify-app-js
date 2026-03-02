import {vi} from 'vitest';

// jest-fetch-mock uses jest.fn() at module init time.
// Set the jest global before dynamically importing it so the module loads cleanly.
Object.assign(globalThis, {jest: vi});

// Dynamic import ensures the assignment above runs before jest-fetch-mock initialises.
const {default: fetchMock} = await import('jest-fetch-mock');

fetchMock.enableMocks();

beforeEach(() => {
  fetchMock.mockReset();
});
