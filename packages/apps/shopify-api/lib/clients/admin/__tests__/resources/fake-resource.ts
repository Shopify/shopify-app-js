import {Base, FindAllResponse} from '../../../../../rest/base';
import {ResourceNames, ResourcePath} from '../../../../../rest/types';
import {Session} from '../../../../session/session';
import {ApiVersion} from '../../../../types';

interface FakeResourceFindArgs {
  param?: string | null;
  session: Session;
  id: number;
  other_resource_id?: number | null;
}

interface FakeResourceAllArgs {
  param?: string | null;
  session: Session;
}

interface FakeResourceCustomArgs {
  session: Session;
  id: number;
  other_resource_id: number;
}

export class FakeResource extends Base {
  public static apiVersion = ApiVersion.July25;
  protected static resourceNames: ResourceNames[] = [
    {singular: 'fake_resource', plural: 'fake_resources'},
    {
      singular: 'fake_resource_alternative_name',
      plural: 'fake_resource_alternative_names',
    },
  ];

  protected static readOnlyAttributes: string[] = ['unsaveable_attribute'];

  protected static hasOne = {
    has_one_attribute: this,
  };

  protected static hasMany = {
    has_many_attribute: this,
  };

  protected static paths: ResourcePath[] = [
    {
      http_method: 'get',
      operation: 'get',
      ids: ['id'],
      path: 'fake_resources/<id>.json',
    },
    {
      http_method: 'get',
      operation: 'get',
      ids: [],
      path: 'fake_resources.json',
    },
    {
      http_method: 'post',
      operation: 'post',
      ids: [],
      path: 'fake_resources.json',
    },
    {
      http_method: 'put',
      operation: 'put',
      ids: ['id'],
      path: 'fake_resources/<id>.json',
    },
    {
      http_method: 'delete',
      operation: 'delete',
      ids: ['id'],
      path: 'fake_resources/<id>.json',
    },
    {
      http_method: 'get',
      operation: 'get',
      ids: ['id', 'other_resource_id'],
      path: 'other_resources/<other_resource_id>/fake_resources/<id>.json',
    },
    {
      http_method: 'get',
      operation: 'custom',
      ids: ['id', 'other_resource_id'],
      path: 'other_resources/<other_resource_id>/fake_resources/<id>/custom.json',
    },
    {
      http_method: 'delete',
      operation: 'delete',
      ids: ['id', 'other_resource_id'],
      path: 'other_resources/<other_resource_id>/fake_resources/<id>.json',
    },
  ];

  public static async find({
    session,
    id,
    other_resource_id = null,
    param = null,
    ...otherArgs
  }: FakeResourceFindArgs): Promise<FakeResource | null> {
    const result = await this.baseFind<FakeResource>({
      session,
      urlIds: {id, other_resource_id},
      params: {param, ...otherArgs},
      requireIds: true,
    });
    return result.data ? result.data[0] : null;
  }

  public static async all({
    session,
    param = null,
    ...otherArgs
  }: FakeResourceAllArgs): Promise<FindAllResponse<FakeResource>> {
    return this.baseFind<FakeResource>({
      session,
      urlIds: {},
      params: {param, ...otherArgs},
    });
  }

  public static async custom({
    session,
    id,
    other_resource_id,
  }: FakeResourceCustomArgs): Promise<Body> {
    const response = await this.request<Body>({
      http_method: 'get',
      operation: 'custom',
      session,
      urlIds: {id, other_resource_id},
    });

    return response.body;
  }

  id?: number | string | null;
  attribute?: string | null;
  has_one_attribute?: FakeResource | null;
  has_many_attribute?: FakeResource[] | null;
  other_resource_id?: number | null;
}
