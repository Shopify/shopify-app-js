import * as mongodb from 'mongodb';
import {Session} from '@shopify/shopify-api';
import {SessionStorage} from '@shopify/shopify-app-session-storage';

export interface MongoDBSessionStorageOptions {
  sessionCollectionName: string;
  /**
   * Connect without verified TLS when `NODE_ENV` is `production`. Set this
   * only for a MongoDB server on a network you trust.
   */
  allowInsecureConnection?: boolean;
}
const defaultMongoDBSessionStorageOptions: MongoDBSessionStorageOptions = {
  sessionCollectionName: 'shopify_sessions',
  allowInsecureConnection: false,
};

const TLS_VERIFICATION_OVERRIDES = [
  'tlsinsecure',
  'tlsallowinvalidcertificates',
  'tlsallowinvalidhostnames',
];

// The driver reads option names case-insensitively, so check every spelling of
// an option rather than the last one, which could differ from the one it uses.
function usesVerifiedTls(url: URL): boolean {
  const valuesOf = (option: string) =>
    [...url.searchParams]
      .filter(([key]) => key.toLowerCase() === option)
      .map(([, value]) => value);
  const tlsValues = [...valuesOf('tls'), ...valuesOf('ssl')];
  const tlsEnabled =
    tlsValues.length === 0
      ? url.protocol === 'mongodb+srv:'
      : tlsValues.every((value) => value === 'true');

  return (
    tlsEnabled &&
    !TLS_VERIFICATION_OVERRIDES.some((option) =>
      valuesOf(option).includes('true'),
    )
  );
}

export class MongoDBSessionStorage implements SessionStorage {
  static withCredentials(
    host: string,
    dbName: string,
    username: string,
    password: string,
    opts: Partial<MongoDBSessionStorageOptions>,
  ) {
    return new MongoDBSessionStorage(
      new URL(
        `mongodb://${encodeURIComponent(username)}:${encodeURIComponent(
          password,
        )}@${host}/?tls=true`,
      ),
      dbName,
      opts,
    );
  }

  public readonly ready: Promise<void>;
  private options: MongoDBSessionStorageOptions;
  // `mongodb` has no types for `MongoClient`???!
  private client: any;

  constructor(
    private dbUrl: URL,
    private dbName: string,
    opts: Partial<MongoDBSessionStorageOptions> = {},
  ) {
    if (typeof this.dbUrl === 'string') {
      this.dbUrl = new URL(this.dbUrl);
    }
    this.options = {...defaultMongoDBSessionStorageOptions, ...opts};
    if (
      process.env.NODE_ENV === 'production' &&
      !this.options.allowInsecureConnection &&
      !usesVerifiedTls(this.dbUrl)
    ) {
      throw new Error(
        'MongoDBSessionStorage requires TLS with certificate and host name ' +
          'verification in production. Use a mongodb+srv:// URL or add ' +
          'tls=true to the URL, and do not set tlsInsecure, ' +
          'tlsAllowInvalidCertificates or tlsAllowInvalidHostnames. For a ' +
          'server on a network you trust, set allowInsecureConnection: true.',
      );
    }
    this.ready = this.init();
  }

  public async storeSession(session: Session): Promise<boolean> {
    await this.ready;

    await this.collection.findOneAndReplace(
      {id: session.id},
      session.toObject(),
      {
        upsert: true,
      },
    );
    return true;
  }

  public async loadSession(id: string): Promise<Session | undefined> {
    await this.ready;

    const result = await this.collection.findOne({id});

    return result ? new Session(result) : undefined;
  }

  public async deleteSession(id: string): Promise<boolean> {
    await this.ready;
    await this.collection.deleteOne({id});
    return true;
  }

  public async deleteSessions(ids: string[]): Promise<boolean> {
    await this.ready;
    await this.collection.deleteMany({id: {$in: ids}});
    return true;
  }

  public async findSessionsByShop(shop: string): Promise<Session[]> {
    await this.ready;

    const rawResults = await this.collection.find({shop}).toArray();
    if (!rawResults || rawResults?.length === 0) return [];

    return rawResults.map((rawResult: any) => new Session(rawResult));
  }

  public async disconnect(): Promise<void> {
    await this.client.close();
  }

  private get collection() {
    return this.client
      .db(this.dbName)
      .collection(this.options.sessionCollectionName);
  }

  private async init() {
    this.client = new (mongodb as any).MongoClient(this.dbUrl.toString());
    await this.client.connect();
    await this.client.db().command({ping: 1});
    await this.createCollection();
  }

  private async hasSessionCollection(): Promise<boolean> {
    const collections = await this.client.db().collections();
    return collections
      .map((collection: any) => collection.collectionName)
      .includes(this.options.sessionCollectionName);
  }

  private async createCollection() {
    const hasSessionCollection = await this.hasSessionCollection();
    if (!hasSessionCollection) {
      await this.client.db().collection(this.options.sessionCollectionName);
    }
  }
}
