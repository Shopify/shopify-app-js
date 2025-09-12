import {RestResourceError} from '../lib/error';
import {Session} from '../lib/session/session';
import {PageInfo, RestRequestReturn} from '../lib/clients/admin/types';
import {DataType} from '../lib/clients/types';
import {RestClient} from '../lib/clients/admin/rest/client';
import {ApiVersion} from '../lib/types';
import {ConfigInterface} from '../lib/base-types';
import {Headers} from '../runtime/http';

import {IdSet, Body, ResourcePath, ParamSet, ResourceNames} from './types';

/**
 * Normalize an ID value to string format to prevent precision loss
 * for IDs approaching JavaScript's MAX_SAFE_INTEGER (2^53-1)
 */
export function normalizeId(id: number | string | null | undefined): string | null {
  if (id === null || id === undefined) {
    return null;
  }
  return String(id);
}

/**
 * Normalize ID fields in an object, converting all *_id and *_ids fields to strings
 */
export function normalizeIdFields(data: Body): Body {
  if (!data || typeof data !== 'object') return data;

  const normalized = {...data};
  
  for (const key in normalized) {
    const value = normalized[key];
    
    // Handle primary id field
    if (key === 'id') {
      normalized[key] = normalizeId(value);
    }
    // Handle foreign key fields ending with _id
    else if (key.endsWith('_id') && !key.endsWith('_ids')) {
      normalized[key] = normalizeId(value);
    }
    // Handle array of IDs ending with _ids
    else if (key.endsWith('_ids') && Array.isArray(value)) {
      normalized[key] = value.map(normalizeId);
    }
  }
  
  return normalized;
}

interface BaseFindArgs {
  session: Session;
  params?: ParamSet;
  urlIds: IdSet;
  requireIds?: boolean;
}

interface BaseConstructorArgs {
  session: Session;
  fromData?: Body | null;
}

interface SaveArgs {
  update?: boolean;
}

interface RequestArgs extends BaseFindArgs {
  http_method: string;
  operation: string;
  body?: Body | null;
  entity?: Base | null;
}

interface GetPathArgs {
  http_method: string;
  operation: string;
  urlIds: IdSet;
  entity?: Base | null;
}

interface SetClassPropertiesArgs {
  Client: typeof RestClient;
  config: ConfigInterface;
}

export interface FindAllResponse<T = Base> {
  data: T[];
  headers: Headers;
  pageInfo?: PageInfo;
}

export class Base {
  // For instance attributes
  [key: string]: any;

  public static Client: typeof RestClient;
  public static config: ConfigInterface;

  public static apiVersion: string;
  protected static resourceNames: ResourceNames[] = [];

  protected static primaryKey = 'id';
  protected static customPrefix: string | null = null;
  protected static readOnlyAttributes: string[] = [];

  protected static hasOne: Record<string, typeof Base> = {};
  protected static hasMany: Record<string, typeof Base> = {};

  protected static paths: ResourcePath[] = [];

  public static setClassProperties({Client, config}: SetClassPropertiesArgs) {
    this.Client = Client;
    this.config = config;
  }

  protected static async baseFind<T extends Base = Base>({
    session,
    urlIds,
    params,
    requireIds = false,
  }: BaseFindArgs): Promise<FindAllResponse<T>> {
    if (requireIds) {
      const hasIds = Object.entries(urlIds).some(([_key, value]) => value);

      if (!hasIds) {
        throw new RestResourceError(
          'No IDs given for request, cannot find path',
        );
      }
    }

    const response = await this.request<T>({
      http_method: 'get',
      operation: 'get',
      session,
      urlIds,
      params,
    });

    return {
      data: this.createInstancesFromResponse<T>(session, response.body as Body),
      headers: response.headers,
      pageInfo: response.pageInfo,
    };
  }

  protected static async request<T = unknown>({
    session,
    http_method,
    operation,
    urlIds,
    params,
    body,
    entity,
  }: RequestArgs): Promise<RestRequestReturn<T>> {
    const client = new this.Client({
      session,
      apiVersion: this.apiVersion as ApiVersion,
    });

    const path = this.getPath({http_method, operation, urlIds, entity});

    const cleanParams: Record<string, string | number> = {};
    if (params) {
      for (const key in params) {
        if (params[key] !== null) {
          cleanParams[key] = params[key];
        }
      }
    }

    switch (http_method) {
      case 'get':
        return client.get<T>({path, query: cleanParams});
      case 'post':
        return client.post<T>({
          path,
          query: cleanParams,
          data: body!,
          type: DataType.JSON,
        });
      case 'put':
        return client.put<T>({
          path,
          query: cleanParams,
          data: body!,
          type: DataType.JSON,
        });
      case 'delete':
        return client.delete<T>({path, query: cleanParams});
      default:
        throw new Error(`Unrecognized HTTP method "${http_method}"`);
    }
  }

  protected static getJsonBodyName(): string {
    return this.name.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
  }

  protected static getPath({
    http_method,
    operation,
    urlIds,
    entity,
  }: GetPathArgs): string {
    let match: string | null = null;
    let specificity = -1;

    const potentialPaths: ResourcePath[] = [];
    this.paths.forEach((path: ResourcePath) => {
      if (
        http_method !== path.http_method ||
        operation !== path.operation ||
        path.ids.length <= specificity
      ) {
        return;
      }

      potentialPaths.push(path);

      let pathUrlIds: IdSet = {...urlIds};
      path.ids.forEach((id) => {
        if (!pathUrlIds[id] && entity && entity[id]) {
          pathUrlIds[id] = entity[id];
        }
      });

      pathUrlIds = Object.entries(pathUrlIds).reduce(
        (acc: IdSet, [key, value]: [string, string | number | null]) => {
          if (value) {
            acc[key] = value;
          }
          return acc;
        },
        {},
      );

      // If we weren't given all of the path's required ids, we can't use it
      const diff = path.ids.reduce(
        (acc: string[], id: string) => (pathUrlIds[id] ? acc : acc.concat(id)),
        [],
      );
      if (diff.length > 0) {
        return;
      }

      specificity = path.ids.length;
      match = path.path.replace(
        /(<([^>]+)>)/g,
        (_m1, _m2, id) => `${pathUrlIds[id]}`,
      );
    });

    if (!match) {
      const pathOptions = potentialPaths.map((path) => path.path);

      throw new RestResourceError(
        `Could not find a path for request. If you are trying to make a request to one of the following paths, ensure all relevant IDs are set. :\n - ${pathOptions.join(
          '\n - ',
        )}`,
      );
    }

    if (this.customPrefix) {
      return `${this.customPrefix}/${match}`;
    } else {
      return match;
    }
  }

  protected static createInstancesFromResponse<T extends Base = Base>(
    session: Session,
    data: Body,
  ): T[] {
    let instances: T[] = [];
    this.resourceNames.forEach((resourceName) => {
      const singular = resourceName.singular;
      const plural = resourceName.plural;
      if (data[plural] || Array.isArray(data[singular])) {
        instances = instances.concat(
          (data[plural] || data[singular]).reduce(
            (acc: T[], entry: Body) =>
              acc.concat(this.createInstance<T>(session, entry)),
            [],
          ),
        );
      } else if (data[singular]) {
        instances.push(this.createInstance<T>(session, data[singular]));
      }
    });

    return instances;
  }

  protected static createInstance<T extends Base = Base>(
    session: Session,
    data: Body,
    prevInstance?: T,
  ): T {
    const instance: T = prevInstance
      ? prevInstance
      : new (this as any)({session});

    if (data) {
      // Check for large numeric IDs that might lose precision
      if (data.id && typeof data.id === 'number') {
        const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;
        const WARNING_THRESHOLD = Math.floor(MAX_SAFE_INTEGER * 0.9);
        
        if (data.id > MAX_SAFE_INTEGER) {
          console.warn(
            `⚠️ Shopify ID ${data.id} (${this.name} resource) exceeds JavaScript's safe integer limit (${MAX_SAFE_INTEGER}). ` +
            `This ID must be handled as a string to prevent precision loss.`
          );
        } else if (data.id > WARNING_THRESHOLD) {
          console.warn(
            `⚠️ Shopify ID ${data.id} (${this.name} resource) is approaching JavaScript's safe integer limit. ` +
            `Consider migrating to string-based ID handling.`
          );
        }
      }
      
      // Normalize ID fields to prevent precision loss
      const normalizedData = normalizeIdFields(data);
      instance.setData(normalizedData);
    }

    return instance;
  }

  #session: Session;

  get session(): Session {
    return this.#session;
  }

  constructor({session, fromData}: BaseConstructorArgs) {
    this.#session = session;

    if (fromData) {
      this.setData(fromData);
    }
  }

  public async save({update = false}: SaveArgs = {}): Promise<void> {
    const {primaryKey, resourceNames} = this.resource();
    const method = this[primaryKey] ? 'put' : 'post';

    const data = this.serialize(true);

    const response = await this.resource().request({
      http_method: method,
      operation: method,
      session: this.session,
      urlIds: {},
      body: {[this.resource().getJsonBodyName()]: data},
      entity: this,
    });

    const flattenResourceNames: string[] = resourceNames.reduce<string[]>(
      (acc, obj) => {
        return acc.concat(Object.values(obj));
      },
      [],
    );

    const matchResourceName = Object.keys(response.body as Body).filter(
      (key: string) => flattenResourceNames.includes(key),
    );

    const body: Body | undefined = (response.body as Body)[
      matchResourceName[0]
    ];

    if (update && body) {
      this.setData(body);
    }
  }

  public async saveAndUpdate(): Promise<void> {
    await this.save({update: true});
  }

  public async delete(): Promise<void> {
    await this.resource().request({
      http_method: 'delete',
      operation: 'delete',
      session: this.session,
      urlIds: {},
      entity: this,
    });
  }

  public serialize(saving = false): Body {
    const {hasMany, hasOne, readOnlyAttributes} = this.resource();

    return Object.entries(this).reduce((acc: Body, [attribute, value]) => {
      if (
        ['#session'].includes(attribute) ||
        (saving && readOnlyAttributes.includes(attribute))
      ) {
        return acc;
      }

      if (attribute in hasMany && value) {
        acc[attribute] = value.reduce((attrAcc: Body, entry: Base) => {
          return attrAcc.concat(this.serializeSubAttribute(entry, saving));
        }, []);
      } else if (attribute in hasOne && value) {
        acc[attribute] = this.serializeSubAttribute(value, saving);
      } else {
        acc[attribute] = value;
      }

      return acc;
    }, {});
  }

  public toJSON(): Body {
    return this.serialize();
  }

  public request<T = unknown>(args: RequestArgs) {
    return this.resource().request<T>(args);
  }

  protected setData(data: Body): void {
    const {hasMany, hasOne} = this.resource();

    // Normalize ID fields first to ensure consistency
    const normalizedData = normalizeIdFields(data);

    Object.entries(normalizedData).forEach(([attribute, val]) => {
      if (attribute in hasMany) {
        const HasManyResource: typeof Base = hasMany[attribute];
        this[attribute] = [];
        val.forEach((entry: Body) => {
          const obj = new HasManyResource({session: this.session});
          if (entry) {
            obj.setData(entry);
          }

          this[attribute].push(obj);
        });
      } else if (attribute in hasOne) {
        const HasOneResource: typeof Base = hasOne[attribute];
        const obj = new HasOneResource({session: this.session});
        if (val) {
          obj.setData(val);
        }
        this[attribute] = obj;
      } else {
        this[attribute] = val;
      }
    });
  }

  protected resource(): typeof Base {
    return this.constructor as unknown as typeof Base;
  }

  private serializeSubAttribute(attribute: Base, saving: boolean): Body {
    return attribute.serialize
      ? attribute.serialize(saving)
      : this.resource()
          .createInstance(this.session, attribute)
          .serialize(saving);
  }
}
