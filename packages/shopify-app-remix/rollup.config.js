import fs from 'fs';

import * as pkg from '../../package.json';
import {
  getPlugins,
  esmConfigs,
  cjsConfigs,
} from '../../config/rollup/rollup.config';

const basePath = `${__dirname}/src/server/adapters`;
const adapterConfigs = fs
  .readdirSync(basePath, {withFileTypes: true})
  .filter((dirent) => dirent.isDirectory() && dirent.name !== '__tests__')
  .reduce(
    (acc, {name}) =>
      acc.concat(
        {
          input: `src/server/adapters/${name}/index.ts`,
          plugins: getPlugins(`./dist/esm/server/adapters/${name}`),
          external: Object.keys(pkg.dependencies),
          output: [
            {
              ...esmConfigs,
              dir: `./dist/esm/server/adapters/${name}`,
              preserveModulesRoot: `src/server/adapters/${name}`,
            },
          ],
        },
        {
          input: `src/server/adapters/${name}/index.ts`,
          plugins: getPlugins(`./dist/cjs/server/adapters/${name}`),
          external: Object.keys(pkg.dependencies),
          output: [
            {
              ...cjsConfigs,
              dir: `./dist/cjs/server/adapters/${name}`,
              preserveModulesRoot: `src/server/adapters/${name}`,
            },
          ],
        },
      ),
    [],
  );

const config = [
  ...adapterConfigs,
  {
    input: 'src/server/index.ts',
    plugins: getPlugins('./dist/esm/server'),
    external: Object.keys(pkg.dependencies),
    output: [
      {
        ...esmConfigs,
        dir: './dist/esm/server',
        preserveModulesRoot: 'src/server',
      },
    ],
  },
  {
    input: 'src/server/index.ts',
    plugins: getPlugins('./dist/cjs/server'),
    external: Object.keys(pkg.dependencies),
    output: [
      {
        ...cjsConfigs,
        dir: './dist/cjs/server',
        preserveModulesRoot: 'src/server',
      },
    ],
  },
  {
    input: 'src/react/index.ts',
    plugins: getPlugins('./dist/esm/react'),
    external: Object.keys(pkg.dependencies),
    output: [
      {
        ...esmConfigs,
        dir: './dist/esm/react',
        preserveModulesRoot: 'src/react',
      },
    ],
  },
  {
    input: 'src/react/index.ts',
    plugins: getPlugins('./dist/cjs/react'),
    external: Object.keys(pkg.dependencies),
    output: [
      {
        ...cjsConfigs,
        dir: './dist/cjs/react',
        preserveModulesRoot: 'src/react',
      },
    ],
  },
];

export default config;
