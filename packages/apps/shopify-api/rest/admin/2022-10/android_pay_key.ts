/***********************************************************************************************************************
* This file is auto-generated. If you have an issue, please create a GitHub issue.                                     *
***********************************************************************************************************************/

import {Base} from '../../base';
import {ResourcePath, ResourceNames} from '../../types';
import {Session} from '../../../lib/session/session';
import {ApiVersion} from '../../../lib/types';

interface FindArgs {
  session: Session;
  id: number | string;
}
interface DeleteArgs {
  session: Session;
  id: number | string;
}

export class AndroidPayKey extends Base {
  public static apiVersion = ApiVersion.October22;

  protected static hasOne: {[key: string]: typeof Base} = {};
  protected static hasMany: {[key: string]: typeof Base} = {};
  protected static paths: ResourcePath[] = [
    {"http_method": "delete", "operation": "delete", "ids": ["id"], "path": "android_pay_keys/<id>.json"},
    {"http_method": "get", "operation": "get", "ids": ["id"], "path": "android_pay_keys/<id>.json"},
    {"http_method": "post", "operation": "post", "ids": [], "path": "android_pay_keys.json"}
  ];
  protected static resourceNames: ResourceNames[] = [
    {
      "singular": "android_pay_key",
      "plural": "android_pay_keys"
    }
  ];

  public static async find(
    {
      session,
      id
    }: FindArgs
  ): Promise<AndroidPayKey | null> {
    const result = await this.baseFind<AndroidPayKey>({
      session: session,
      requireIds: true,
      urlIds: {"id": id},
      params: {},
    });
    return result.data ? result.data[0] : null;
  }

  public static async delete(
    {
      session,
      id
    }: DeleteArgs
  ): Promise<unknown> {
    const response = await this.request<AndroidPayKey>({
      http_method: "delete",
      operation: "delete",
      session: session,
      urlIds: {"id": id},
      params: {},
    });

    return response ? response.body : null;
  }

  public id: string | null;
  public public_key: string | null;
}
