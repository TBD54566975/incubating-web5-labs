declare global {
  export interface Window {
    Go: any;
    createDIDKey: ()=>any
    parseJWTCredential: (jwt: string)=>any
    createVerifiableCredential: (issuerDID: string, issuerDIDPrivateKey: string, subjectJSON: string)=>any
    verifyJWTCredential: (vcJWT: string, publicKeyBase58: string)=>any
  }
}

export {};
