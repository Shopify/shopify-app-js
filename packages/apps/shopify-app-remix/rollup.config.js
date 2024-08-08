import fs from 'fs';

import {getConfig} from '../../../config/rollup/rollup-utils';

import * as pkg from './package.json';

const basePath = `${__dirname}/src/server/adapters`;

const adapterInputs = fs
  .readdirSync(basePath, {withFileTypes: true})
  .filter((dirent) => dirent.isDirectory() && dirent.name !== '__tests__')
  .map(({name}) => `src/server/adapters/${name}/index.ts`);

export default getConfig({
  pkg,
  input: [
    'src/server/index.ts',
    'src/server/test-helpers/index.ts',
    'src/react/index.ts',
    ...adapterInputs,
  ],
});
