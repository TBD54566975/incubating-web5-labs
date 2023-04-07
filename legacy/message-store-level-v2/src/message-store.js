import * as Block from 'multiformats/block';
import * as cbor from '@ipld/dag-cbor';
import _ from 'lodash';
import searchIndex from 'search-index';

import { Temporal } from '@js-temporal/polyfill';
import { CID } from 'multiformats';
import { Encoder } from './encoder.js';
import { exporter } from 'ipfs-unixfs-exporter';
import { importer } from 'ipfs-unixfs-importer';
import { sha256 } from 'multiformats/hashes/sha2';
import { base58btc } from 'multiformats/bases/base58';
import { Blockstore } from './block-store.js';
import { Level } from 'level';

/**
 * A simple implementation of {@link MessageStore} that works in both the browser and server-side.
 * Leverages LevelDB under the hood.
 */
export class MessageStoreLevelv2 {
  #config;
  #db;
  #eventLog;
  #index;

  /**
   * @param {MessageStoreLevelConfig} config
   * @param {string} config.blockstoreLocation - must be a directory path (relative or absolute) where
   *  LevelDB will store its files, or in browsers, the name of the
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/IDBDatabase IDBDatabase} to be opened.
   * @param {string} config.indexLocation - same as config.blockstoreLocation
   */
  constructor(config) {
    this.#config = {
      blockstoreLocation: 'BLOCKSTORE',
      indexLocation: 'INDEX',
      ...config
    };

    this.#db = new Blockstore(this.#config.blockstoreLocation);
    this.#eventLog = new Level('EVENTLOG');
  }

  async open() {
    if (!this.#db) {
      this.#db = new Blockstore(this.#config.blockstoreLocation);
    }

    await this.#db.open();

    // calling `searchIndex()` twice without closing its DB causes the process to hang (ie. calling this method consecutively),
    // so check to see if the index has already been "opened" before opening it again.
    if (!this.#index) {
      this.#index = await searchIndex({ name: this.#config.indexLocation });
    }
  }

  async close() {
    await this.#db.close();
    await this.#index.INDEX.STORE.close(); // MUST close index-search DB, else `searchIndex()` triggered in a different instance will hang indefinitely
    await this.#eventLog.close();
  }

  async has(cid) {
    const bytes = await this.#db.get(cid);

    return !!bytes;
  }

  async get(cid) {
    const bytes = await this.#db.get(cid);

    if (!bytes) {
      return;
    }

    const decodedBlock = await Block.decode({ bytes, codec: cbor, hasher: sha256 });

    const messageJson = decodedBlock.value;

    if (!messageJson.descriptor['dataCid']) {
      return messageJson;
    }

    // data is chunked into dag-pb unixfs blocks. re-inflate the chunks.
    const dataReferencingMessage = decodedBlock.value;
    const dataCid = CID.parse(dataReferencingMessage.descriptor.dataCid);

    const dataDagRoot = await exporter(dataCid, this.#db);
    const dataBytes = new Uint8Array(dataDagRoot.size);
    let offset = 0;

    for await (const chunk of dataDagRoot.content()) {
      dataBytes.set(chunk, offset);
      offset += chunk.length;
    }

    dataReferencingMessage.encodedData = Encoder.bytesToBase64Url(dataBytes);

    return messageJson;
  }

  /**
   * TODO: decide whether the first arg should be a generalized query or explictly `target`
   * TODO: write JSDoc for @returns
   * @param {string} tenant - the tenant to get event log for
   * @param {string} [watermark]  - where to start
   * @returns 
   */
  async getEventLog(tenant, watermark) {
    const tenantPrefix = await MessageStoreLevelv2.#hash(tenant);
    const tenantEventLog = this.#eventLog.sublevel(tenantPrefix);

    if (!tenantEventLog) {
      return [];
    }

    let opts = {};

    if (watermark) {
      opts.gt = watermark;
    }

    const events = [];
    for await (let [key, value] of tenantEventLog.iterator(opts)) {
      const event = {
        watermark: key,
        messageCid: value
      }

      events.push(event);
    }

    return events;
  }

  async query(criteria) {
    const messages = [];

    // parse query into a query that is compatible with the index we're using
    const queryTerms = MessageStoreLevelv2.#buildIndexQueryTerms(criteria);

    const { RESULT: indexResults } = await this.#index.QUERY({ AND: queryTerms });

    for (const result of indexResults) {
      const cid = CID.parse(result._id);
      const message = await this.get(cid);

      messages.push(message);
    }

    return messages;
  }


  async delete(cid) {
    await this.#db.delete(cid);
    await this.#index.DELETE(cid.toString());

    return;
  }

  async put(messageJson, indexes) {
    // make a shallow copy so we don't mess up the references (e.g. `encodedData`) of original message
    let messageCopy = { ...messageJson };

    // delete `encodedData` if it exists so `messageJson` is stored without it, `encodedData` will be decoded, chunked and stored separately below
    let encodedData = undefined;
    if (messageCopy['encodedData'] !== undefined) {
      const messageJsonWithEncodedData = messageCopy;
      encodedData = messageJsonWithEncodedData.encodedData;

      delete messageJsonWithEncodedData.encodedData;
    }

    const encodedBlock = await Block.encode({ value: messageCopy, codec: cbor, hasher: sha256 });

    await this.#db.put(encodedBlock.cid, encodedBlock.bytes);

    // if `encodedData` is present we'll decode it then chunk it and store it as unix-fs dag-pb encoded
    if (encodedData) {
      const content = Encoder.base64UrlToBytes(encodedData);
      const chunk = importer([{ content }], this.#db, { cidVersion: 1 });

      // for some reason no-unused-vars doesn't work in for loops. it's not entirely surprising because
      // it does seem a bit strange to iterate over something you never end up using but in this case
      // we really don't have to access the result of `chunk` because it's just outputting every unix-fs
      // entry that's getting written to the blockstore. the last entry contains the root cid
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for await (const _ of chunk) { ; }
    }

    const indexDocument = {
      _id: encodedBlock.cid.toString(),
      ...indexes
    };

    // tokenSplitRegex is used to tokenize values. By default, only letters and digits are indexed,
    // overriding to include all characters, examples why we need to include more than just letters and digits:
    // 'did:example:alice'                    - ':'
    // '337970c4-52e0-4bd7-b606-bfc1d6fe2350' - '-'
    // 'application/json'                     - '/'
    await this.#index.PUT([indexDocument], { tokenSplitRegex: /.+/ });

    const tenantHash = await MessageStoreLevelv2.#hash(indexDocument.target);
    const eventId = MessageStoreLevelv2.generateID();

    const tenantEventLog = this.#eventLog.sublevel(tenantHash);
    await tenantEventLog.put(eventId, encodedBlock.cid.toString())
  }

  /**
   * deletes everything in the underlying datastore and indices.
   */
  async clear() {
    await this.#db.clear();
    await this.#eventLog.clear();
    await this.#index.FLUSH();
  }

  /**
   * recursively parses a query object into a list of flattened terms that can be used to query the search
   * index
   * @example
   * buildIndexQueryTerms({
   *    ability : {
   *      method : 'CollectionsQuery',
   *      schema : 'https://schema.org/MusicPlaylist'
   *    }
   * })
   * // returns
   * [
        { FIELD: ['ability.method'], VALUE: 'CollectionsQuery' },
        { FIELD: ['ability.schema'], VALUE: 'https://schema.org/MusicPlaylist' }
      ]
   * @param query - the query to parse
   * @param terms - internally used to collect terms
   * @param prefix - internally used to pass parent properties into recursive calls
   * @returns the list of terms
   */
  static #buildIndexQueryTerms(
    query,
    terms = [],
    prefix = ''
  ) {
    for (const property in query) {
      const val = query[property];

      if (_.isPlainObject(val)) {
        MessageStoreLevelv2.#buildIndexQueryTerms(val, terms, `${prefix}${property}.`);
      } else {
        // NOTE: using object-based expressions because we need to support filters against non-string properties
        const term = {
          FIELD: [`${prefix}${property}`],
          VALUE: val
        };
        terms.push(term);
      }
    }

    return terms;
  }

  /**
   * returns system time as a plain ISO date string with microsecond precision
   * using @js-temporal/polyfill
   */
  static generateID() {
    return Temporal.Now.instant().epochNanoseconds.toString();
  }

  static async #hash(prefix) {
    const bytes = Encoder.stringToBytes(prefix);
    const bytesHashed = await sha256.encode(bytes);
    const hashBase58BtcEncoded = base58btc.baseEncode(bytesHashed);

    return hashBase58BtcEncoded;
  }
}