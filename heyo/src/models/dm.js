import { RecordsWrite } from '@tbd54566975/dwn-sdk-js';
import { base64url } from 'multiformats/bases/base64';

export class DM {
  #content;
  #message;
  #threadId;
  
  constructor(content, threadId) {
    this.#content = content;
    this.#threadId = threadId;
  }

  get content() {
    return this.#content;
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

  get threadId() {
    return this.#message.threadId;
  }

  get dateCreated() {
    return this.#message.descriptor.dateCreated;
  }
  
  async toDWebMessage(signatureInput) {
    if (this.#message) {
      return this.#message;
    }
    
    const rawDM = {
      content: this.#content
    };

    const dataStringified = JSON.stringify(rawDM);
    const dataBytes = new TextEncoder().encode(dataStringified);
    
    const message = await RecordsWrite.create({
      contextId                   : this.#threadId,
      data                        : dataBytes, 
      dataFormat                  : 'application/json',
      parentId                    : this.#threadId,
      protocol                    : 'heyo',
      published                   : true,
      schema                      : 'heyo/dm',
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
    
    const { content } = JSON.parse(dataStringified);
    
    const dm = new DM(content);
    dm.#message = message;

    return dm;
  }
}