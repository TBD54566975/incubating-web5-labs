import { RecordsWrite } from '@tbd54566975/dwn-sdk-js';
import { base64url } from 'multiformats/bases/base64';

export class Contact {
  #did;
  #handle;
  #message;
  
  constructor(did, handle) {
    this.#did = did;
    this.#handle = handle;
  }

  get did() {
    return this.#did;
  }

  get handle() {
    return this.#handle;
  }

  get data() {
    return { did: this.#did, handle: this.#handle };
  }

  get recordId() {
    return this.#message.recordId;
  }

  get dateCreated() {
    return this.#message.descriptor.dateCreated;
  }
  
  async toDWebMessage(signatureInput) {
    if (this.#message) {
      return this.#message;
    }
    
    const rawContact = {
      did    : this.#did,
      handle : this.#handle
    };

    const dataStringified = JSON.stringify(rawContact);
    const dataBytes = new TextEncoder().encode(dataStringified);
    
    const message = await RecordsWrite.create({
      data                        : dataBytes, 
      dataFormat                  : 'application/json',
      schema                      : 'contact',
      authorizationSignatureInput : signatureInput,
    });

    this.#message = message.toJSON();

    return this.#message;
  }

  static fromDWebMessage(message) {
    const { encodedData } = message;
    
    const dataBytes = base64url.baseDecode(encodedData);
    const dataStringified = new TextDecoder().decode(dataBytes);
    
    const { did, handle } = JSON.parse(dataStringified);
    
    const contact = new Contact(did, handle);
    contact.#message = message;

    return contact;
  }
}