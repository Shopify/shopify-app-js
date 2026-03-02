import {mergeConfig} from 'vitest/config';
import baseConfig from '../../../../config/tests/vitest.config';

export default mergeConfig(baseConfig, {
  test: {
    testTimeout: 30000,
    // KV tests use miniflare; fetch mocking from baseConfig interferes with it.
    setupFiles: [],
  },
});
