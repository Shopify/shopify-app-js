import {mergeConfig} from 'vitest/config';
import baseConfig from '../../../../config/tests/vitest.config';

export default mergeConfig(baseConfig, {
  test: {
    testTimeout: 70000,
  },
});
