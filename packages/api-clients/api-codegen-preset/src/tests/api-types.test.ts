import fs from 'fs';

import {shopifyApiTypes} from '../api-types';
import {ApiType, ShopifyApiProjectOptions} from '../types';

import {getExpectedSchema} from './helpers';

describe('shopifyApiTypes', () => {
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
        const projectConfig = shopifyApiTypes(config);

        // THEN
        const expectedSchema = getExpectedSchema(type, true);

        expect(projectConfig).toEqual({
          [`./testDir/${type}-2024-10.schema.json`]: {
            schema: expectedSchema,
            plugins: ['introspection'],
            config: {minify: true},
          },
          [`./testDir/${type}.types.d.ts`]: {
            schema: expectedSchema,
            plugins: ['typescript'],
          },
          [`./testDir/${type}.generated.d.ts`]: {
            schema: expectedSchema,
            documents: config.documents,
            preset: expect.anything(),
            presetConfig: {apiType, module: 'module'},
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
        spy.mockReturnValueOnce(true);

        // WHEN
        const projectConfig = shopifyApiTypes(config);

        // THEN
        expect(projectConfig).toEqual({
          [`./testDir/${type}.types.d.ts`]: {
            schema: `./testDir/${type}-2024-10.schema.json`,
            plugins: ['typescript'],
          },
          [`./testDir/${type}.generated.d.ts`]: {
            schema: `./testDir/${type}-2024-10.schema.json`,
            documents: config.documents,
            preset: expect.anything(),
            presetConfig: {apiType, module: 'module'},
          },
        });
      });

      it('defaults missing configs to URLs when file is not present', () => {
        // GIVEN
        const config: ShopifyApiProjectOptions = {apiType, apiKey: 'test'};

        // WHEN
        const projectConfig = shopifyApiTypes(config);

        // THEN
        const expectedSchema = getExpectedSchema(type, false);

        expect(projectConfig).toEqual({
          [`./${type}.schema.json`]: {
            schema: expectedSchema,
            plugins: ['introspection'],
            config: {minify: true},
          },
          [`./${type}.types.d.ts`]: {
            schema: expectedSchema,
            plugins: ['typescript'],
          },
          [`./${type}.generated.d.ts`]: {
            schema: expectedSchema,
            documents: ['**/*.{ts,tsx}', '!**/node_modules'],
            preset: expect.anything(),
            presetConfig: {apiType, module: undefined},
          },
        });
      });

      it('does not use declaration files when setting is false', () => {
        // GIVEN
        const config: ShopifyApiProjectOptions = {
          apiType,
          apiKey: 'test',
          declarations: false,
        };

        const spy = jest.spyOn(fs, 'existsSync');
        spy.mockReturnValueOnce(true);

        // WHEN
        const projectConfig = shopifyApiTypes(config);

        // THEN
        expect(projectConfig).toEqual({
          [`./${type}.types.ts`]: {
            schema: `./${type}.schema.json`,
            plugins: ['typescript'],
          },
          [`./${type}.generated.ts`]: {
            schema: `./${type}.schema.json`,
            documents: ['**/*.{ts,tsx}', '!**/node_modules'],
            preset: expect.anything(),
            presetConfig: {apiType, module: undefined},
          },
        });
      });

      it('includes enumsAsConst config when option is true', () => {
        // GIVEN
        const config: ShopifyApiProjectOptions = {
          apiType,
          enumsAsConst: true,
          apiKey: 'test',
        };

        const spy = jest.spyOn(fs, 'existsSync');
        spy.mockReturnValueOnce(true);

        // WHEN
        const projectConfig = shopifyApiTypes(config);

        // THEN
        expect(projectConfig[`./${type}.types.d.ts`]).toEqual(
          expect.objectContaining({
            schema: `./${type}.schema.json`,
            plugins: ['typescript'],
            config: {
              enumsAsConst: true,
            },
          }),
        );
      });

      it('includes enumsAsConst config when option is false', () => {
        // GIVEN
        const config: ShopifyApiProjectOptions = {
          apiType,
          enumsAsConst: false,
          apiKey: 'test',
        };

        const spy = jest.spyOn(fs, 'existsSync');
        spy.mockReturnValueOnce(true);

        // WHEN
        const projectConfig = shopifyApiTypes(config);

        // THEN
        expect(projectConfig[`./${type}.types.d.ts`]).toEqual(
          expect.objectContaining({
            schema: `./${type}.schema.json`,
            plugins: ['typescript'],
            config: {
              enumsAsConst: false,
            },
          }),
        );
      });

      it('excludes config when enumsAsConst is not provided', () => {
        // GIVEN
        const config: ShopifyApiProjectOptions = {
          apiType,
          apiKey: 'test',
        };

        const spy = jest.spyOn(fs, 'existsSync');
        spy.mockReturnValueOnce(true);

        // WHEN
        const projectConfig = shopifyApiTypes(config);

        // THEN
        expect(projectConfig[`./${type}.types.d.ts`]).toEqual({
          schema: `./${type}.schema.json`,
          plugins: ['typescript'],
          // No config property expected
        });
        expect(projectConfig[`./${type}.types.d.ts`]).not.toHaveProperty(
          'config',
        );
      });
    },
  );
});
