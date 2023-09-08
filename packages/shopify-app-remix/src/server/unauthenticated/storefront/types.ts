import {GraphQLClient} from '../../clients/types';

export interface StorefrontContext {
  /**
   * TODO: Add TSDoc
   */
  graphql: GraphQLClient;
}

export type GetStorefrontContext = (shop: string) => Promise<StorefrontContext>;
