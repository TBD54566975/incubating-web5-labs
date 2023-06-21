import { DidIonApi } from '@tbd54566975/dids'

const didState = await new DidIonApi().create({
  services: [{
    id              : 'dwn',
    type            : 'DecentralizedWebNode',
    serviceEndpoint : {
      nodes: [ `http://0.0.0.0:8080` ]
    }
  }]
});

const { keys } = didState;
const [ key ] = keys;
const { privateKeyJwk } = key;
const kidFragment = privateKeyJwk.kid || key.id;
const kid = `${didState.id}#${kidFragment}`;
const signatureInput = {
  privateJwk      : privateKeyJwk,
  protectedHeader : { alg: privateKeyJwk.crv, kid }
};

console.log(didState.id)
console.log()
console.log(JSON.stringify(signatureInput, null, 2))
