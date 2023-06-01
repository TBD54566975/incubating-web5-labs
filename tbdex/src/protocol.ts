export const pfiDid = 'did:ion:EiBkf15wrtFO9jKHk6k8H81p2_aTChBvaMzdE7MPRsrXdQ:eyJkZWx0YSI6eyJwYXRjaGVzIjpbeyJhY3Rpb24iOiJyZXBsYWNlIiwiZG9jdW1lbnQiOnsicHVibGljS2V5cyI6W3siaWQiOiJhdXRoeiIsInB1YmxpY0tleUp3ayI6eyJjcnYiOiJzZWNwMjU2azEiLCJrdHkiOiJFQyIsIngiOiJIY1otNkV1ejRFLW40THQ1V0dIdEFWdW81NUlkekVVLUt3YW5SbnBmbEhVIiwieSI6IlZlRHR1TUVwNm8wVndYdl8tTEZkRVNlY1RSS2tMUVBBVVpMY3ROZWdfY0EifSwicHVycG9zZXMiOlsiYXV0aGVudGljYXRpb24iXSwidHlwZSI6Ikpzb25XZWJLZXkyMDIwIn0seyJpZCI6ImVuYyIsInB1YmxpY0tleUp3ayI6eyJjcnYiOiJzZWNwMjU2azEiLCJrdHkiOiJFQyIsIngiOiJ2R0hBcHJwTGRLWUxfNWg5NUw5ZTQzVUdRNVM0RGhDTEYzeVh5M1NLQlg4IiwieSI6IlJOZGJFdWVXd2NMT0xoTGpmeWJGelZGVzNNdTIxcDdRcXZyTzdfeXI3U1UifSwicHVycG9zZXMiOlsia2V5QWdyZWVtZW50Il0sInR5cGUiOiJKc29uV2ViS2V5MjAyMCJ9XSwic2VydmljZXMiOlt7ImlkIjoiZHduIiwic2VydmljZUVuZHBvaW50Ijp7Im1lc3NhZ2VBdXRob3JpemF0aW9uS2V5cyI6WyIjYXV0aHoiXSwibm9kZXMiOlsiaHR0cHM6Ly9kd24udGJkZGV2Lm9yZy9kd24xIiwiaHR0cHM6Ly9kd24udGJkZGV2Lm9yZy9kd24yIl0sInJlY29yZEVuY3J5cHRpb25LZXlzIjpbIiNlbmMiXX0sInR5cGUiOiJEZWNlbnRyYWxpemVkV2ViTm9kZSJ9XX19XSwidXBkYXRlQ29tbWl0bWVudCI6IkVpQlZRbkpvcFdGaF9rVkZua1pTWENXSms2Ulk2bzN2ZnhwUTRLcFZyaEZtT3cifSwic3VmZml4RGF0YSI6eyJkZWx0YUhhc2giOiJFaUFiTHVveTFQdXJwRGs1RU9aYmtkanFHekNoUGZ3WU9wbFpfT0hPdVYxRmt3IiwicmVjb3ZlcnlDb21taXRtZW50IjoiRWlEUS1GOVVfeE5jaDJHdlJoZ2o5VVRsbjctdTNXbG1qX01Dc2Y4VVVnOWpydyJ9fQ';

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
