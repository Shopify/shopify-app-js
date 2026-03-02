import {mergeConfig} from 'vitest/config';
import baseConfig from '../../../../config/tests/vitest.config';

export default mergeConfig(baseConfig, {
  test: {
    passWithNoTests: true,
  },
});
