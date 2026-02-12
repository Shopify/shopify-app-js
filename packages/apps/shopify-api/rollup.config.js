import fs from 'fs';

import {getConfig} from '../../../config/rollup/rollup-utils';

import * as pkg from './package.json';

const adapterPath = `${__dirname}/adapters`;
const adapterInputs = fs
  .readdirSync(adapterPath, {withFileTypes: true})
  .filter(
    (dirent) =>
      dirent.isDirectory() &&
      !['__tests__', '__e2etests__'].includes(dirent.name),
  )
  .map(({name}) => `adapters/${name}/index.ts`);

const restPath = `${__dirname}/rest/admin`;
const restInputs = fs
  .readdirSync(restPath, {withFileTypes: true})
  .filter(
    (dirent) =>
      dirent.isDirectory() &&
      !['__tests__', '__e2etests__'].includes(dirent.name),
  )
  .map(({name}) => `rest/admin/${name}/index.ts`);

export default getConfig({
  pkg,
  input: ['lib/index.ts', 'runtime/index.ts', 'test-helpers/index.ts', ...adapterInputs, ...restInputs],
});
