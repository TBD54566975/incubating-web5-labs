import { Web5 } from '@tbd54566975/web5';

//#region utilities
const waitForEnter = async () =>
  new Promise(resolve => {
    const onData = (chunk) => {
      if (chunk.includes('\n')) {
        cleanup();
        resolve();
      }
    };

    const cleanup = () => {
      process.stdin.off('data', onData);
    };

    process.stdin.setEncoding('utf8');
    console.log('Please press Enter to continue...');
    process.stdin.on('data', onData);
  });
//#endregion

/** remote */ const proxyDid = 'did:ion:EiBun5O3MQXc8rn1mj8XgHZ-EOaZAQryJ4g-fIrNKhB2KQ:eyJkZWx0YSI6eyJwYXRjaGVzIjpbeyJhY3Rpb24iOiJyZXBsYWNlIiwiZG9jdW1lbnQiOnsicHVibGljS2V5cyI6W3siaWQiOiJkd24iLCJwdWJsaWNLZXlKd2siOnsiY3J2Ijoic2VjcDI1NmsxIiwia3R5IjoiRUMiLCJ4IjoiUzBWME9GU2wwNGhENnduYVRhdEoyM0VCam5NWkxpNmc2N3FUMWotcDZOayIsInkiOiJKNzFZcllabHRtNWx4eXBrUDk5bThkSkNacndBWXkxYm5TdXhuWlRtdnZFIn0sInB1cnBvc2VzIjpbImF1dGhlbnRpY2F0aW9uIl0sInR5cGUiOiJKc29uV2ViS2V5MjAyMCJ9XSwic2VydmljZXMiOlt7ImlkIjoiZHduIiwic2VydmljZUVuZHBvaW50Ijp7Im5vZGVzIjpbImh0dHA6Ly90YmRvbGxhcnMta2VuZGFsbC50YmRkZXYub3JnL2R3biJdfSwidHlwZSI6IkRlY2VudHJhbGl6ZWRXZWJOb2RlIn1dfX1dLCJ1cGRhdGVDb21taXRtZW50IjoiRWlCcGg3UU1sQ2VQem1BRDhNNUF1MXpvV0hVNzNPZUUyYmNRS1VTdW52cFJQUSJ9LCJzdWZmaXhEYXRhIjp7ImRlbHRhSGFzaCI6IkVpQ0pOZVRNVnpVYmdFZUtnLTUtdnBpdGYyLVJNUndnaGFuaFFNY05fWXhIRFEiLCJyZWNvdmVyeUNvbW1pdG1lbnQiOiJFaUNSdWVESGgzSGFNb205YmhyU2lDRUNlVVNwbDU2TjRYdmpXUUpPTEZ6YlZ3In19';
// /** local */ const proxyDid = 'did:ion:EiBpdZGL8Bz7etyCCuBplLVq5qBg2kHQbF-KJDZqWycaUw:eyJkZWx0YSI6eyJwYXRjaGVzIjpbeyJhY3Rpb24iOiJyZXBsYWNlIiwiZG9jdW1lbnQiOnsicHVibGljS2V5cyI6W3siaWQiOiJkd24iLCJwdWJsaWNLZXlKd2siOnsiY3J2Ijoic2VjcDI1NmsxIiwia3R5IjoiRUMiLCJ4IjoiM1NnQzVRTGNNdTQyWmQyQ0NubkZhQU11Wm1XVFZfem1OdnhGa203R0tLSSIsInkiOiJSaWhOb3ZCeWxFMTNwNi02RnNaVXFCNXBUQlhla3hLRDM3QlBHenRuRTFjIn0sInB1cnBvc2VzIjpbImF1dGhlbnRpY2F0aW9uIl0sInR5cGUiOiJKc29uV2ViS2V5MjAyMCJ9XSwic2VydmljZXMiOlt7ImlkIjoiZHduIiwic2VydmljZUVuZHBvaW50Ijp7Im5vZGVzIjpbImh0dHA6Ly8wLjAuMC4wOjgwODAiXX0sInR5cGUiOiJEZWNlbnRyYWxpemVkV2ViTm9kZSJ9XX19XSwidXBkYXRlQ29tbWl0bWVudCI6IkVpQ0Q2R2RoOXlrMTlSVmRGZkVIRndveWoyQ0FuSnZ2cVV6Q2t6TktmNzA4dWcifSwic3VmZml4RGF0YSI6eyJkZWx0YUhhc2giOiJFaUN2VFZhZHZTbEVHeXhnNlJNOTFYajh2WjZvczRBTDZ3UG9BRDVtWnFhTE9RIiwicmVjb3ZlcnlDb21taXRtZW50IjoiRWlCdG5aa3NocEg0Q1Y2cTVrSlZGbVIwSE9HX3ctVzh3Rk9Dc01IandfWVNydyJ9fQ';

const { web5, did } = await Web5.connect();
console.log('This client DID:', did)

//#region OFFER
console.log('Offer...')
const offer = await web5.dwn.records.query({
  from: proxyDid,
  message: {
    filter: {
      protocol: 'tbdex',
      schema: 'offering'
    }
  }
})
console.log('Offer response:', await offer.records[0].data.json())
await waitForEnter();
//#endregion

//#region RFQ
console.log('RFQ...')
const myRfq = await web5.dwn.records.write({
  data: {
    some: 'rfq data and stuff'
  }
})
const rfq = await myRfq.record.send(proxyDid)
console.log('RFQ response:', rfq)
await waitForEnter()
//#endregion

//#region Quote
console.log('Quote...')
console.log('TODO need protocols operational for this to work')
const endpoint = 'http://tbdollars-kendall.tbddev.org/dwn/quote';
const quoteResponse = await fetch(endpoint, {
  method: 'POST',
  body: JSON.stringify({
    targetDid: did,
    quote: {
      some: 'quote data and stuff'
    }
  })
})
console.log('Quote response:', quoteResponse.status)
console.log('TODO read the quote from Alice\'s data store');
await waitForEnter();
//#endregion

//#region Order
console.log('Order...')
const myOrder = await web5.dwn.records.write({
  data: {
    some: 'order data and stuff'
  }
})
const order = await myOrder.record.send(proxyDid)
console.log('Order response:', order)
await waitForEnter()
//#endregion

console.log('TODO OrderStatus')
