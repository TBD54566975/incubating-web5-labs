export const protocolDefinition = {
  'protocol': 'https://tbd.website/protocols/tbdex',
  'types': {
    'RFQ': {
      'schema': 'https://tbd.website/protocols/tbdex/RequestForQuote',
      'dataFormats': [
        'application/json'
      ]
    },
    'Quote': {
      'schema': 'https://tbd.website/protocols/tbdex/Quote',
      'dataFormats': [
        'application/json'
      ]
    }
  },
  'structure': {
    'RFQ': {
      '$actions': [
        {
          'who': 'anyone',
          'can': 'write'
        }
      ],
      'Quote': {
        '$actions': [
          {
            'who': 'recipient',
            'of': 'RFQ',
            'can': 'write'
          }
        ]
      }
    }
  }
};
