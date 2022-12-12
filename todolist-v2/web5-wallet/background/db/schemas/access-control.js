export const AccessControlSchema = {
  title: 'access control schema',
  version: 0,
  primaryKey: 'domain',
  type: 'object',
  properties: {
    domain: {
      type: 'string',
      maxLength: 50
    },
    did: {
      type: 'string',
      maxLength: 60
    },
    isAllowed: {
      type: 'boolean'
    }
  },
  required: ['did', 'domain', 'isAllowed']
};