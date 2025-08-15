import fs from 'fs';

import {shopifyApiProject} from '../api-project';
import {ApiType, ShopifyApiProjectOptions} from '../types';

import {getExpectedSchema} from './helpers';

describe('shopifyApiProject', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe.each([ApiType.Admin, ApiType.Storefront, ApiType.Customer])(
    'when API type is %s',
    (apiType) => {
      const type = apiType.toLowerCase();

      it("loads schema from URL when file isn't present", () => {
        // GIVEN
        const config: ShopifyApiProjectOptions = {
          apiType,
          apiVersion: '2024-10',
          apiKey: 'test',
          outputDir: './testDir',
          documents: ['./src/**/*.ts'],
          module: 'module',
        };

        // WHEN
        const projectConfig = shopifyApiProject(config);

        // THEN
        expect(projectConfig).toEqual({
          schema: getExpectedSchema(type, true),
          documents: config.documents,
          extensions: {
            // This is tested by the api-types file
            codegen: expect.anything(),
          },
        });
      });

      it('loads schema from file when file is present', () => {
        // GIVEN
        const config: ShopifyApiProjectOptions = {
          apiType,
          apiVersion: '2024-10',
          apiKey: 'test',
          outputDir: './testDir',
          documents: ['./src/**/*.ts'],
          module: 'module',
        };

        const spy = jest.spyOn(fs, 'existsSync');
        spy.mockReturnValue(true);

        // WHEN
        const projectConfig = shopifyApiProject(config);

        // THEN
        expect(projectConfig).toEqual({
          schema: `./testDir/${type}-2024-10.schema.json`,
          documents: config.documents,
          extensions: {
            // This is tested by the api-types file
            codegen: expect.anything(),
          },
        });
      });

      it('defaults missing values', () => {
        // GIVEN
        const config: ShopifyApiProjectOptions = {
          apiType,
          apiKey: 'test',
        };

        // WHEN
        const projectConfig = shopifyApiProject(config);

        // THEN
        expect(projectConfig).toEqual({
          schema: getExpectedSchema(type, false),
          documents: ['**/*.{ts,tsx}', '!node_modules'],
          extensions: {
            // The contents of this object are tested by the api-types file
            codegen: expect.objectContaining({
              generates: expect.objectContaining({
                [`./${type}.types.d.ts`]: expect.anything(),
                [`./${type}.generated.d.ts`]: expect.anything(),
              }),
            }),
          },
        });
      });

      it('does not use declaration files when setting is false', () => {
        // GIVEN
        const config: ShopifyApiProjectOptions = {
          apiType,
          declarations: false,
          apiKey: 'test',
        };

        // WHEN
        const projectConfig = shopifyApiProject(config);

        // THEN
        expect(projectConfig).toEqual({
          schema: getExpectedSchema(type, false),
          documents: ['**/*.{ts,tsx}', '!node_modules'],
          extensions: {
            // The contents of this object are tested by the api-types file
            codegen: expect.objectContaining({
              generates: expect.objectContaining({
                [`./${type}.types.ts`]: expect.anything(),
                [`./${type}.generated.ts`]: expect.anything(),
              }),
            }),
          },
        });
      });

      it('passes enumsAsConst option to shopifyApiTypes when true', () => {
        // GIVEN
        const config: ShopifyApiProjectOptions = {
          apiType,
          enumsAsConst: true,
          apiKey: 'test',
        };

        // WHEN
        const projectConfig = shopifyApiProject(config);

        // THEN
        expect(
          projectConfig.extensions.codegen.generates[`./${type}.types.d.ts`],
        ).toEqual(
          expect.objectContaining({
            schema: expect.anything(),
            plugins: ['typescript'],
            config: {
              enumsAsConst: true,
            },
          }),
        );
      });

      it('passes enumsAsConst option to shopifyApiTypes when false', () => {
        // GIVEN
        const config: ShopifyApiProjectOptions = {
          apiType,
          enumsAsConst: false,
          apiKey: 'test',
        };

        // WHEN
        const projectConfig = shopifyApiProject(config);

        // THEN
        expect(
          projectConfig.extensions.codegen.generates[`./${type}.types.d.ts`],
        ).toEqual(
          expect.objectContaining({
            schema: expect.anything(),
            plugins: ['typescript'],
            config: {
              enumsAsConst: false,
            },
          }),
        );
      });

      it('does not include config when enumsAsConst is not provided', () => {
        // GIVEN
        const config: ShopifyApiProjectOptions = {
          apiType,
          apiKey: 'test',
        };

        // WHEN
        const projectConfig = shopifyApiProject(config);

        // THEN
        expect(
          projectConfig.extensions.codegen.generates[`./${type}.types.d.ts`],
        ).toEqual({
          schema: expect.anything(),
          plugins: ['typescript'],
        });
        expect(
          projectConfig.extensions.codegen.generates[`./${type}.types.d.ts`],
        ).not.toHaveProperty('config');
      });
    },
  );
});
