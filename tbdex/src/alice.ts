import type { Offering } from './common.js';

import { Web5 } from '@tbd54566975/web5';
// Fetch & render offerings from PFI

const { web5, did } = await Web5.connect();

console.log('Alice: Alice did is', did)

// how does Alice find PFI's DID? 
// similar thing to what we had to do with Dinger - we first spin up PFI, get its DID, then hardcode it here so Alice can know about it so Alice can talk to the PFI.

const pfiDid = 'did:ion:EiBkf15wrtFO9jKHk6k8H81p2_aTChBvaMzdE7MPRsrXdQ:eyJkZWx0YSI6eyJwYXRjaGVzIjpbeyJhY3Rpb24iOiJyZXBsYWNlIiwiZG9jdW1lbnQiOnsicHVibGljS2V5cyI6W3siaWQiOiJhdXRoeiIsInB1YmxpY0tleUp3ayI6eyJjcnYiOiJzZWNwMjU2azEiLCJrdHkiOiJFQyIsIngiOiJIY1otNkV1ejRFLW40THQ1V0dIdEFWdW81NUlkekVVLUt3YW5SbnBmbEhVIiwieSI6IlZlRHR1TUVwNm8wVndYdl8tTEZkRVNlY1RSS2tMUVBBVVpMY3ROZWdfY0EifSwicHVycG9zZXMiOlsiYXV0aGVudGljYXRpb24iXSwidHlwZSI6Ikpzb25XZWJLZXkyMDIwIn0seyJpZCI6ImVuYyIsInB1YmxpY0tleUp3ayI6eyJjcnYiOiJzZWNwMjU2azEiLCJrdHkiOiJFQyIsIngiOiJ2R0hBcHJwTGRLWUxfNWg5NUw5ZTQzVUdRNVM0RGhDTEYzeVh5M1NLQlg4IiwieSI6IlJOZGJFdWVXd2NMT0xoTGpmeWJGelZGVzNNdTIxcDdRcXZyTzdfeXI3U1UifSwicHVycG9zZXMiOlsia2V5QWdyZWVtZW50Il0sInR5cGUiOiJKc29uV2ViS2V5MjAyMCJ9XSwic2VydmljZXMiOlt7ImlkIjoiZHduIiwic2VydmljZUVuZHBvaW50Ijp7Im1lc3NhZ2VBdXRob3JpemF0aW9uS2V5cyI6WyIjYXV0aHoiXSwibm9kZXMiOlsiaHR0cHM6Ly9kd24udGJkZGV2Lm9yZy9kd24xIiwiaHR0cHM6Ly9kd24udGJkZGV2Lm9yZy9kd24yIl0sInJlY29yZEVuY3J5cHRpb25LZXlzIjpbIiNlbmMiXX0sInR5cGUiOiJEZWNlbnRyYWxpemVkV2ViTm9kZSJ9XX19XSwidXBkYXRlQ29tbWl0bWVudCI6IkVpQlZRbkpvcFdGaF9rVkZua1pTWENXSms2Ulk2bzN2ZnhwUTRLcFZyaEZtT3cifSwic3VmZml4RGF0YSI6eyJkZWx0YUhhc2giOiJFaUFiTHVveTFQdXJwRGs1RU9aYmtkanFHekNoUGZ3WU9wbFpfT0hPdVYxRmt3IiwicmVjb3ZlcnlDb21taXRtZW50IjoiRWlEUS1GOVVfeE5jaDJHdlJoZ2o5VVRsbjctdTNXbG1qX01Dc2Y4VVVnOWpydyJ9fQ'

// couldn't do const { records, status } ? rtR
// also this comes back with a promise containing empty records 
const { records, status } = await web5.dwn.records.query({
    from: pfiDid,
    message: {
        filter: {
            schema: 'tbdex.io/schemas/offering'

        }
    }
})

if (status.code !== 200) {
    alert('life is hard');
}

for (let record of records) {
    const offering = await record.data.json();
    console.log('offering!', offering)
}

// console.log('offering from PFI', respoxnse)