import {Session} from '@shopify/shopify-api';

import {BasicParams} from '../../types';

export interface AdminClientOptions {
  params: BasicParams;
  session: Session;
  handleClientError?: HandleAdminClientError;
}

export type HandleAdminClientError = (arg: {
  error: any;
  params: BasicParams;
  session: Session;
}) => Promise<void>;
