import type {ApiType} from '../types';

import {apiConfigs} from './api-configs';

export function getOutputFiles(apiType: ApiType, declarations: boolean) {
  const config = apiConfigs[apiType];
  const extension = declarations ? 'd.ts' : 'ts';

  return {
    typesFile: `${config.typesFile}.${extension}`,
    queryTypesFile: `${config.queryTypesFile}.${extension}`,
  };
}
