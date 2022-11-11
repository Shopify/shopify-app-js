import * as mongodb from 'mongodb';
import {Session} from '@shopify/shopify-api';

const defaultMongoDBSessionStorageOptions = {
  sessionCollectionName: 'shopify_sessions',
};

export class MongoDBSessionStorage {
  static withCredentials(host, dbName, username, password, opts) {
    return new MongoDBSessionStorage(
      new URL(
        `mongodb://${encodeURIComponent(username)}:${encodeURIComponent(
          password,
        )}@${host}/`,
      ),
      dbName,
      opts,
    );
  }

  constructor(dbUrl, dbName, opts = {}) {
    this.dbUrl = dbUrl;
    this.dbName = dbName;
    if (typeof this.dbUrl === 'string') {
      this.dbUrl = new URL(this.dbUrl);
    }
    this.options = {...defaultMongoDBSessionStorageOptions, ...opts};
    this.ready = this.init();
  }

  async storeSession(session) {
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

  async loadSession(id) {
    await this.ready;

    const result = await this.collection.findOne({id});

    return result ? new Session(result) : undefined;
  }

  async deleteSession(id) {
    await this.ready;
    await this.collection.deleteOne({id});
    return true;
  }

  async deleteSessions(ids) {
    await this.ready;
    await this.collection.deleteMany({id: {$in: ids}});
    return true;
  }

  async findSessionsByShop(shop) {
    await this.ready;

    const rawResults = await this.collection.find({shop}).toArray();
    if (!rawResults || rawResults?.length === 0) return [];

    return rawResults.map((rawResult) => new Session(rawResult));
  }

  async disconnect() {
    await this.client.close();
  }

  get collection() {
    return this.client
      .db(this.dbName)
      .collection(this.options.sessionCollectionName);
  }

  async init() {
    this.client = new mongodb.MongoClient(this.dbUrl.toString());
    await this.client.connect();
    await this.client.db().command({ping: 1});
    await this.createCollection();
  }

  async hasSessionCollection() {
    const collections = await this.client.db().collections();
    return collections
      .map((collection) => collection.collectionName)
      .includes(this.options.sessionCollectionName);
  }

  async createCollection() {
    const hasSessionCollection = await this.hasSessionCollection();
    if (!hasSessionCollection) {
      await this.client.db().collection(this.options.sessionCollectionName);
    }
  }
}
