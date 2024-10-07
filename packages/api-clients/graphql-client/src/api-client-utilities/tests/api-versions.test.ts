import {
  getCurrentApiVersion,
  getCurrentSupportedApiVersions,
} from '../api-versions';

const mockDate = new Date('2024-10-15');

describe('getCurrentApiVersion()', () => {
  beforeEach(() => {
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns the current API version based on the current date', () => {
    const currentVersion = getCurrentApiVersion();

    expect(currentVersion).toEqual({
      year: 2024,
      quarter: 4,
      version: '2024-10',
    });
  });
});

describe('getCurrentSupportedApiVersions()', () => {
  beforeEach(() => {
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns the a list of supported API version based on the current date', () => {
    const currentVersions = getCurrentSupportedApiVersions();

    expect(currentVersions).toEqual([
      '2024-01',
      '2024-04',
      '2024-07',
      '2024-10',
      '2025-01',
      'unstable',
    ]);
  });
});
