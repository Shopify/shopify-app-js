import type {Types} from '@graphql-codegen/plugin-helpers';
import {preset as hydrogenPreset} from '@shopify/graphql-codegen';

import {type ShopifyApiPresetConfig} from './types';
import {apiConfigs} from './helpers/api-configs';
import {getOutputFiles} from './helpers/get-output-files';

export const preset: Types.OutputPreset<ShopifyApiPresetConfig> = {
  buildGeneratesSection: (options) => {
    const apiType = options.presetConfig.apiType;

    const {interfaceExtension, module, presetConfigs} = apiConfigs[apiType];

    // Determine if the output file is a declaration file
    const isDts = options.baseOutputDir.endsWith('.d.ts');

    // Get the correct filename with extension (.d.ts or .ts)
    const {typesFile} = getOutputFiles(apiType, isDts);

    return hydrogenPreset.buildGeneratesSection({
      ...options,
      presetConfig: {
        ...presetConfigs,
        importTypes: {
          namespace: presetConfigs.importTypes.namespace,
          from: `./${typesFile}`,
        },
        interfaceExtension: ({
          queryType,
          mutationType,
        }: {
          queryType: string;
          mutationType: string;
        }) =>
          interfaceExtension
            .replace('%%MODULE%%', options.presetConfig.module ?? module)
            .replace('%%QUERY%%', queryType)
            .replace('%%MUTATION%%', mutationType),
      },
    });
  },
};
