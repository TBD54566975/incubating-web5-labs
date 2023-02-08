import { RecordsWrite } from '@tbd54566975/dwn-sdk-js';
import { base64url } from 'multiformats/bases/base64';

export class Thread {
  #message;
  #threadWith;
  
  constructor(threadWith) {
    this.#threadWith = threadWith;
  }

  get author() {
    const [ signature ] = this.#message.attestation.signatures;
    const protectedHeaderBytes = base64url.baseDecode(signature.protected);
    const protectedHeaderString = new TextDecoder().decode(protectedHeaderBytes);
    const { kid } = JSON.parse(protectedHeaderString);

    const [ did ] = kid.split('#');

    return did;
  }

  get recipient() {
    return this.#message.descriptor.recipient;
  }

  get recordId() {
    return this.#message.recordId;
  }
  
  get contextId() {
    return this.#message.contextId;
  }

  get dateCreated() {
    return this.#message.descriptor.dateCreated;
  }
  
  async toDWebMessage(signatureInput) {
    if (this.#message) {
      return this.#message;
    }
    
    const rawThread = {
      threadWith: this.#threadWith
    };

    const dataStringified = JSON.stringify(rawThread);
    const dataBytes = new TextEncoder().encode(dataStringified);
    
    const message = await RecordsWrite.create({
      data                        : dataBytes, 
      dataFormat                  : 'application/json',
      protocol                    : 'heyo',
      recipient                   : this.#threadWith,
      schema                      : 'heyo/thread',
      authorizationSignatureInput : signatureInput,
      attestationSignatureInputs  : [signatureInput]
    });

    this.#message = message.toJSON();

    return this.#message;
  }

  static fromDWebMessage(message) {
    const { encodedData } = message;
    
    const dataBytes = base64url.baseDecode(encodedData);
    const dataStringified = new TextDecoder().decode(dataBytes);
    
    const { threadWith } = JSON.parse(dataStringified);
    
    const thread = new Thread(threadWith);
    thread.#message = message;

    return thread;
  }
}