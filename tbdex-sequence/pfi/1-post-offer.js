const res = await fetch('http://0.0.0.0:8080/offer', {
  method: 'POST'
})
const recordId = res.headers.get('dwn-record-id')
console.log('Record ID', recordId);
