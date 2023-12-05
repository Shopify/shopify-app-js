import {Session} from '@shopify/shopify-api';
import {BasicParams} from 'src/server/types';

import {triggerAfterAuthHook} from '../admin/helpers';

import {Job} from './job';

interface AfterAuthJobParemeters {
  params: BasicParams;
  session: Session;
  request: Request;
}

export class AfterAuthJob extends Job<AfterAuthJobParemeters> {
  async run(): Promise<any> {
    const {params, session, request} = this.parameters;
    const {logger} = params;
    logger.info('Running the afterAuth hook asynchronously');
    triggerAfterAuthHook(params, session, request);
    return Promise.resolve();
  }
}
