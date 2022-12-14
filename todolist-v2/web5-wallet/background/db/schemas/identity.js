export const IdentitySchema = {
  title      : 'identity schema',
  version    : 0,
  primaryKey : 'did',
  type       : 'object',
  properties : {
    name: {
      type      : 'string',
      maxLength : 50
    },
    did: {
      type      : 'string',
      maxLength : 60
    },
    publicJWK: {
      type       : 'object',
      properties : {
        alg: {
          enum: ['EdDSA']
        },
        crv: {
          enum: ['Ed25519']
        },
        kty: {
          enum: ['OKP']
        },
        use: {
          enum: ['sig']
        },
        x: {
          type      : 'string',
          maxLength : 50
        }
      },
      required: ['alg', 'crv', 'kty', 'use', 'x']
    },
    privateJWK: {
      type       : 'object',
      properties : {
        alg: {
          enum: ['EdDSA']
        },
        crv: {
          enum: ['Ed25519']
        },
        kty: {
          enum: ['OKP']
        },
        use: {
          enum: ['sig']
        },
        x: {
          type      : 'string',
          maxLength : 50
        },
        d: {
          type      : 'string',
          maxLength : 50
        }
      },
      required: ['alg', 'crv', 'kty', 'use', 'x', 'd']
    }
  },
  required : ['name', 'did', 'publicJWK', 'privateJWK'],
  indexes  : ['name']
};