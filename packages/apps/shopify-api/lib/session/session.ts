/* eslint-disable no-fallthrough */

import {InvalidSession} from '../error';
import {OnlineAccessInfo} from '../auth/oauth/types';
import {AuthScopes} from '../auth/scopes';
import {decryptValue, encryptValue, CIPHER_PREFIX} from '../../runtime/crypto';

import {SessionParams} from './types';

type SessionParamsArray = [string, string | number | boolean][];

interface ToEncryptedPropertyArrayOptions {
  cryptoKey: CryptoKey;
  returnUserData?: boolean;
  propertiesToEncrypt?: string[];
}

interface FromEncryptedPropertyArrayOptions {
  cryptoKey: CryptoKey;
  returnUserData?: boolean;
}

interface FlattenPropertiesOptions {
  returnUserData: boolean;
  propertiesToSave?: string[];
}

/**
 * Stores App information from logged in merchants so they can make authenticated requests to the Admin API.
 */
export class Session {
  public static DEFAULT_ENCRYPTED_PROPERTIES = ['accessToken'];

  private static DEFAULT_PROPERTIES_TO_SAVE = [
    'id',
    'shop',
    'state',
    'isOnline',
    'scope',
    'accessToken',
    'expires',
    'onlineAccessInfo',
  ];

  public static fromPropertyArray(
    entries: SessionParamsArray,
    returnUserData = false,
  ): Session {
    if (!Array.isArray(entries)) {
      throw new InvalidSession(
        'The parameter is not an array: a Session cannot be created from this object.',
      );
    }

    const obj = Object.fromEntries(
      entries
        .filter(([_key, value]) => value !== null && value !== undefined)
        // Sanitize keys
        .map(([key, value]) => {
          switch (key.toLowerCase()) {
            case 'isonline':
              return ['isOnline', value];
            case 'accesstoken':
              return ['accessToken', value];
            case 'onlineaccessinfo':
              return ['onlineAccessInfo', value];
            case 'userid':
              return ['userId', value];
            case 'firstname':
              return ['firstName', value];
            case 'lastname':
              return ['lastName', value];
            case 'accountowner':
              return ['accountOwner', value];
            case 'emailverified':
              return ['emailVerified', value];
            default:
              return [key, value];
          }
        }),
    );

    const sessionData = {} as SessionParams;
    const onlineAccessInfo = {
      associated_user: {},
    } as OnlineAccessInfo;
    Object.entries(obj).forEach(([key, value]) => {
      switch (key) {
        case 'isOnline':
          if (typeof value === 'string') {
            sessionData[key] = value.toString().toLowerCase() === 'true';
          } else if (typeof value === 'number') {
            sessionData[key] = Boolean(value);
          } else {
            sessionData[key] = value;
          }
          break;
        case 'scope':
          sessionData[key] = value.toString();
          break;
        case 'expires':
          sessionData[key] = value ? new Date(Number(value)) : undefined;
          break;
        case 'onlineAccessInfo':
          onlineAccessInfo.associated_user.id = Number(value);
          break;
        case 'userId':
          if (returnUserData) {
            onlineAccessInfo.associated_user.id = Number(value);
            break;
          }
        case 'firstName':
          if (returnUserData) {
            onlineAccessInfo.associated_user.first_name = String(value);
            break;
          }
        case 'lastName':
          if (returnUserData) {
            onlineAccessInfo.associated_user.last_name = String(value);
            break;
          }
        case 'email':
          if (returnUserData) {
            onlineAccessInfo.associated_user.email = String(value);
            break;
          }
        case 'accountOwner':
          if (returnUserData) {
            onlineAccessInfo.associated_user.account_owner = Boolean(value);
            break;
          }
        case 'locale':
          if (returnUserData) {
            onlineAccessInfo.associated_user.locale = String(value);
            break;
          }
        case 'collaborator':
          if (returnUserData) {
            onlineAccessInfo.associated_user.collaborator = Boolean(value);
            break;
          }
        case 'emailVerified':
          if (returnUserData) {
            onlineAccessInfo.associated_user.email_verified = Boolean(value);
            break;
          }
        // Return any user keys as passed in
        default:
          sessionData[key] = value;
      }
    });
    if (sessionData.isOnline) {
      sessionData.onlineAccessInfo = onlineAccessInfo;
    }
    const session = new Session(sessionData);
    return session;
  }

  public static async fromEncryptedPropertyArray(
    entries: SessionParamsArray,
    {cryptoKey, returnUserData = false}: FromEncryptedPropertyArrayOptions,
  ) {
    const decryptedEntries: SessionParamsArray = [];
    for (const [key, value] of entries) {
      if (value.toString().startsWith(CIPHER_PREFIX)) {
        decryptedEntries.push([
          key,
          await decryptValue(value as string, cryptoKey),
        ]);
      } else {
        decryptedEntries.push([key, value]);
      }
    }

    return this.fromPropertyArray(decryptedEntries, returnUserData);
  }

  /**
   * The unique identifier for the session.
   */
  readonly id: string;
  /**
   * The Shopify shop domain, such as `example.myshopify.com`.
   */
  public shop: string;
  /**
   * The state of the session. Used for the OAuth authentication code flow.
   */
  public state: string;
  /**
   * Whether the access token in the session is online or offline.
   */
  public isOnline: boolean;
  /**
   * The desired scopes for the access token, at the time the session was created.
   */
  public scope?: string;
  /**
   * The date the access token expires.
   */
  public expires?: Date;
  /**
   * The access token for the session.
   */
  public accessToken?: string;
  /**
   * Information on the user for the session. Only present for online sessions.
   */
  public onlineAccessInfo?: OnlineAccessInfo;

  constructor(params: SessionParams) {
    Object.assign(this, params);
  }

  /**
   * Whether the session is active. Active sessions have an access token that is not expired, and has has the given
   * scopes if scopes is equal to a truthy value.
   */
  public isActive(scopes: AuthScopes | string | string[] | undefined): boolean {
    const hasAccessToken = Boolean(this.accessToken);
    const isTokenNotExpired = !this.isExpired();
    const isScopeChanged = this.isScopeChanged(scopes);
    return !isScopeChanged && hasAccessToken && isTokenNotExpired;
  }

  /**
   * Whether the access token has the given scopes.
   */
  public isScopeChanged(
    scopes: AuthScopes | string | string[] | undefined,
  ): boolean {
    if (typeof scopes === 'undefined') {
      return false;
    }
    const scopesObject =
      scopes instanceof AuthScopes ? scopes : new AuthScopes(scopes);

    return !scopesObject.equals(this.scope);
  }

  /**
   * Whether the access token is expired.
   */
  public isExpired(withinMillisecondsOfExpiry = 0): boolean {
    return Boolean(
      this.expires &&
        this.expires.getTime() - withinMillisecondsOfExpiry < Date.now(),
    );
  }

  /**
   * Converts a Session into an object with its data, that can be used to construct another Session.
   */
  public toObject(): SessionParams {
    return {...this};
  }

  /**
   * Checks whether the given session is equal to this session.
   */
  public equals(other: Session | undefined): boolean {
    if (!other) return false;

    const mandatoryPropsMatch =
      this.id === other.id &&
      this.shop === other.shop &&
      this.state === other.state &&
      this.isOnline === other.isOnline;

    if (!mandatoryPropsMatch) return false;

    const copyA = this.toPropertyArray(true);
    copyA.sort(([k1], [k2]) => (k1 < k2 ? -1 : 1));

    const copyB = other.toPropertyArray(true);
    copyB.sort(([k1], [k2]) => (k1 < k2 ? -1 : 1));

    return JSON.stringify(copyA) === JSON.stringify(copyB);
  }

  /**
   * Converts the session into an array of key-value pairs.
   */
  public toPropertyArray(returnUserData = false): SessionParamsArray {
    return this.flattenProperties(this.toObject(), {returnUserData});
  }

  /**
   * Converts the session into an array of key-value pairs, encrypting sensitive data.
   *
   * The encrypted string will contain both the IV and the encrypted value.
   */
  public async toEncryptedPropertyArray({
    cryptoKey,
    propertiesToEncrypt = Session.DEFAULT_ENCRYPTED_PROPERTIES,
    returnUserData = false,
  }: ToEncryptedPropertyArrayOptions): Promise<SessionParamsArray> {
    const disallowedFields = propertiesToEncrypt.filter((field) =>
      [
        'id',
        'expires',
        'emailVerified',
        'accountOwner',
        'collaborator',
      ].includes(field),
    );
    if (disallowedFields.length > 0) {
      throw new InvalidSession(
        `Can't encrypt fields: [${disallowedFields.join(', ')}]`,
      );
    }

    const allPropertiesToSave = [
      ...new Set([
        ...propertiesToEncrypt,
        ...Session.DEFAULT_PROPERTIES_TO_SAVE,
      ]),
    ];
    const properties = this.flattenProperties(this.toObject(), {
      returnUserData,
      propertiesToSave: allPropertiesToSave,
    });

    return Promise.all(
      properties.map(async ([key, value]) => {
        if (propertiesToEncrypt.includes(key) && value) {
          return [key, await encryptValue(value.toString(), cryptoKey)];
        }
        return [key, value];
      }),
    );
  }

  private flattenProperties(
    params: SessionParams,
    {
      returnUserData = false,
      propertiesToSave = Session.DEFAULT_PROPERTIES_TO_SAVE,
    }: FlattenPropertiesOptions,
  ): SessionParamsArray {
    return (
      Object.entries(params)
        .filter(
          ([key, value]) =>
            propertiesToSave.includes(key) &&
            value !== undefined &&
            value !== null,
        )
        // Prepare values for db storage
        .flatMap(([key, value]): SessionParamsArray => {
          switch (key) {
            case 'expires':
              return [[key, value ? value.getTime() : undefined]];
            case 'onlineAccessInfo':
              // eslint-disable-next-line no-negated-condition
              if (!returnUserData) {
                return [[key, value.associated_user.id]];
              } else {
                return [
                  ['userId', value?.associated_user?.id],
                  ['firstName', value?.associated_user?.first_name],
                  ['lastName', value?.associated_user?.last_name],
                  ['email', value?.associated_user?.email],
                  ['locale', value?.associated_user?.locale],
                  ['emailVerified', value?.associated_user?.email_verified],
                  ['accountOwner', value?.associated_user?.account_owner],
                  ['collaborator', value?.associated_user?.collaborator],
                ];
              }
            default:
              return [[key, value]];
          }
        })
        // Filter out tuples with undefined values
        .filter(([_key, value]) => value !== undefined)
    );
  }
}
