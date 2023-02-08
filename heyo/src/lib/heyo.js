import { createRequire } from 'node:module';
import { RemoteDwnClient } from './remote-dwn-client.js';
import { ProtocolsQuery, ProtocolsConfigure, RecordsQuery } from '@tbd54566975/dwn-sdk-js';
import { Thread } from '../models/thread.js';
import { DM } from '../models/dm.js';

const require = createRequire(import.meta.url);
const heyoProtocol = require('../../resources/heyo-protocol.json');

export class Heyo {  
  static getProtocol() {
    return heyoProtocol;
  }

  static prettyPrintProtocol() {
    return JSON.stringify(Heyo.get(), null, 2);
  }

  static async findThreads(target, filter, signatureMaterial) {
    const query = await RecordsQuery.create({
      filter: {
        ...filter,
        protocol : 'heyo',
        schema   : 'heyo/thread'
      },
      authorizationSignatureInput: signatureMaterial
    });

    const result = await RemoteDwnClient.send(query.toJSON(), target);

    if (result.status.code !== 200) {
      throw new Error(`failed to find threads. error: ${JSON.stringify(result, null, 2)}`);
    }

    const threads = [];
    for (let entry of result.entries) {
      const thread = Thread.fromDWebMessage(entry);
      threads.push(thread);
    }

    return threads;
  }

  static async findThreadWithDid(target, did, signatureMaterial) {
    let threads = await Heyo.findThreads(target, { recipient: did }, signatureMaterial);
  
    if (threads.length > 0) {
      return threads[0];
    }

    threads = await Heyo.findThreads(target, { attester: did }, signatureMaterial);

    if (threads.length > 0) {
      return threads[0];
    }

    return undefined;
  }

  static async listThreads(target, signatureMaterial) {
    return this.findThreads(target, {}, signatureMaterial);
  }

  static async getThreadDMs(target, threadId, signatureMaterial) {
    const query = await RecordsQuery.create({
      filter: {
        contextId : threadId,
        parentId  : threadId,
        protocol  : 'heyo',
        schema    : 'heyo/dm'
      },
      dateSort                    : 'createdAscending',
      authorizationSignatureInput : signatureMaterial
    });

    const result = await RemoteDwnClient.send(query.toJSON(), target);

    if (result.status.code !== 200) {
      throw new Error(`failed to find threads. error: ${JSON.stringify(result, null, 2)}`);
    }

    const dms = [];
    for (let entry of result.entries) {
      const thread = DM.fromDWebMessage(entry);
      dms.push(thread);
    }

    return dms;
  }

  static async initializeProtocol(target, signatureMaterial) {
    const { protocol, definition } = heyoProtocol;
    const query = await ProtocolsQuery.create({
      filter: {
        protocol
      },
      authorizationSignatureInput: signatureMaterial
    });
  
    let result = await RemoteDwnClient.send(query.toJSON(), target);
  
    if (result.status.code !== 200) {
      throw new Error(`failed to initialize protocol. error: ${JSON.stringify(result, null, 2)}`);
    }
  
    const [ existingProtocol ] = result.entries;
  
    if (existingProtocol) {
      return;
    }
  
    const createProtocolMessage = await ProtocolsConfigure.create({
      protocol,
      definition,
      authorizationSignatureInput: signatureMaterial
    });
  
    result = await RemoteDwnClient.send(createProtocolMessage.toJSON(), target);
  
    if (result.status.code !== 202) {
      throw new Error('failed to initialize protocol');
    }
  }
}