export const pfiDid = 'did:ion:EiA-hOya19w_6qOhdjKKjkJWdsEADLekDcjEXen_5Jls0Q:eyJkZWx0YSI6eyJwYXRjaGVzIjpbeyJhY3Rpb24iOiJyZXBsYWNlIiwiZG9jdW1lbnQiOnsicHVibGljS2V5cyI6W3siaWQiOiJhdXRoeiIsInB1YmxpY0tleUp3ayI6eyJjcnYiOiJzZWNwMjU2azEiLCJrdHkiOiJFQyIsIngiOiJnY2xoU1lFaHRvNEpTMFo3MC05WTlBWjZ6cGxkdzVKT3o2RUJoMEVZS1ZrIiwieSI6InpNSjhFaF8tcWNIRjFlMXVrUWZmVUxtLW5rWVNYNWdBUV9qNWhRUW5kVkkifSwicHVycG9zZXMiOlsiYXV0aGVudGljYXRpb24iXSwidHlwZSI6Ikpzb25XZWJLZXkyMDIwIn0seyJpZCI6ImVuYyIsInB1YmxpY0tleUp3ayI6eyJjcnYiOiJzZWNwMjU2azEiLCJrdHkiOiJFQyIsIngiOiJ5aXpwNWVRclVfUnBvWmNrYzd5aUNMLWdxT0VRcWRRaHRGUUZGSUppLUN3IiwieSI6ImNmWjVKODBTSjBBdEhncXM4cGtjSENYRVJURlZKX0ZzMjdYNmtJa2pVTU0ifSwicHVycG9zZXMiOlsia2V5QWdyZWVtZW50Il0sInR5cGUiOiJKc29uV2ViS2V5MjAyMCJ9XSwic2VydmljZXMiOlt7ImlkIjoiZHduIiwic2VydmljZUVuZHBvaW50Ijp7Im1lc3NhZ2VBdXRob3JpemF0aW9uS2V5cyI6WyIjYXV0aHoiXSwibm9kZXMiOlsiaHR0cHM6Ly9kd24udGJkZGV2Lm9yZy9kd24zIiwiaHR0cHM6Ly9kd24udGJkZGV2Lm9yZy9kd242Il0sInJlY29yZEVuY3J5cHRpb25LZXlzIjpbIiNlbmMiXX0sInR5cGUiOiJEZWNlbnRyYWxpemVkV2ViTm9kZSJ9XX19XSwidXBkYXRlQ29tbWl0bWVudCI6IkVpQUo3UF9DNWJWbnlVQmxjQXpnRGtjRGVLdXAyQ01saThxSzdGMVFueHkyUFEifSwic3VmZml4RGF0YSI6eyJkZWx0YUhhc2giOiJFaUR3aXZZb0lfSUV3NkZwdHVvX1pSYkVveUxoLXQ4X0xJdG55UXFRRWpGSlVBIiwicmVjb3ZlcnlDb21taXRtZW50IjoiRWlBTzV4a1ZvNW1qR1J5Smd5WGhhWEczRmxYdFpvQ3VEYkp1ZThtX05WTzFEUSJ9fQ'

/**
 * assumption: $actions array not being present means you can write as the tenant of the current DWN
 * this structure ensures that:
 * - Anyone can write a RFQ to my (PFI) DWN
 * - I (PFI) received an RFQ, so I can respond with a Quote
 */
export const pfiProtocolDefinition = {
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
}

/**
 * assumption: $actions array not being present means you can write as the tenant of the current DWN
 * this structure ensures that:
 * - Only I (Alice) can write an RFQ
 * - Whoever received the RFQ I wrote can write a Quote to my (Alice's) DWN
 */

export const aliceProtocolDefinition = {
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
}

/**
 * Alice is the only one who can send an RFQ
 * Alice is the only one who can receive a Quote
 * 
 * PFI is the only one who can receive an RFQ
 * PFI is the only one who can send a Quote
 * 
 */
