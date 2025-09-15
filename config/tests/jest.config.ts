import path from 'path';
import {fileURLToPath} from 'url';

import type {Config} from 'jest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config: Config = {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  testPathIgnorePatterns: ['<rootDir>/dist', '<rootDir>/.rollup.cache'],
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  setupFilesAfterEnv: [`${__dirname}/setup-jest.ts`],
};

export default config;
