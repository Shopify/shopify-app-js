import path from 'node:path';

import {TSESLint} from '@typescript-eslint/utils';

import {rule} from '../rules/headers-export';

const ruleTester = new TSESLint.RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    projectService: {
      allowDefaultProject: ['src/__virtual__/*.ts'],
      defaultProject: 'tsconfig.json',
    },
    tsconfigRootDir: path.join(__dirname, '../..'),
  },
});

ruleTester.run('headers-export', rule, {
  valid: [
    {
      code: 'enum Values {}',
      filename: 'src/__virtual__/test-file.ts',
    },
    {
      code: 'for (const a in []) {}',
      filename: 'src/__virtual__/test-file.ts',
    },
    {
      code: 'for (const a of []) {}',
      filename: 'src/__virtual__/test-file.ts',
    },
    {
      code: `
        const values = {};
        for (const a in values) {}
      `,
      filename: 'src/__virtual__/test-file.ts',
    },
    {
      code: `
        const values = [];
        for (const a of values) {}
      `,
      filename: 'src/__virtual__/test-file.ts',
    },
  ],
  invalid: [
    {
      code: `
          enum Values {}
          for (const a in Values) {}
      `,
      filename: 'src/__virtual__/test-file.ts',
      errors: [
        {
          column: 27,
          endColumn: 33,
          line: 3,
          endLine: 3,
          messageId: 'loopOverEnum',
        },
      ],
    },
  ],
});
