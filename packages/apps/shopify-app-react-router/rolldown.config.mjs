import fs from 'fs';
import {fileURLToPath} from 'url';
import {dirname} from 'path';
import {getConfig} from '../../../config/rolldown/rolldown-utils.mjs';
import pkg from './package.json' with { type: 'json' };

const __dirname = dirname(fileURLToPath(import.meta.url));
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
