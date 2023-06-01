/**
 * assumption: $actions array not being present means you can write as the tenant of the current DWN
 * this structure ensures that:
 * - Anyone can write a RFQ to my (PFI) DWN
 * - I (PFI) received an RFQ, so I can respond with a Quote
 */
export const pfiProtocolDefinition = {
  'protocol' : 'https://tbd.website/protocols/tbdex',
  'types'    : {
    'RFQ': {
      'schema'      : 'https://tbd.website/protocols/tbdex/RequestForQuote',
      'dataFormats' : [
        'application/json'
      ]
    },
    'Quote': {
      'schema'      : 'https://tbd.website/protocols/tbdex/Quote',
      'dataFormats' : [
        'application/json'
      ]
    }
  },
  'structure': {
    'RFQ': {
      '$actions': [
        {
          'who' : 'anyone',
          'can' : 'write'
        }
      ],
      'Quote': {
        '$actions': [
          {
            'who' : 'recipient',
            'of'  : 'RFQ',
            'can' : 'write'
          }
        ]
      }
    }
  }
};

/**
 * assumption: $actions array not being present means you can write as the tenant of the current DWN
 * this structure ensures that:
 * - Only I (Alice) can write an RFQ
 * - Whoever received the RFQ I wrote can write a Quote to my (Alice's) DWN
 */

export const aliceProtocolDefinition = {
  'protocol' : 'https://tbd.website/protocols/tbdex',
  'types'    : {
    'RFQ': {
      'schema'      : 'https://tbd.website/protocols/tbdex/RequestForQuote',
      'dataFormats' : [
        'application/json'
      ]
    },
    'Quote': {
      'schema'      : 'https://tbd.website/protocols/tbdex/Quote',
      'dataFormats' : [
        'application/json'
      ]
    }
  },
  'structure': {
    'RFQ': {
      'Quote': {
        '$actions': [
          {
            'who' : 'recipient',
            'of'  : 'RFQ',
            'can' : 'write'
          }
        ]
      }
    }
  }
};

/**
 * Alice is the only one who can send an RFQ
 * Alice is the only one who can receive a Quote
 *
 * PFI is the only one who can receive an RFQ
 * PFI is the only one who can send a Quote
 *
 */
