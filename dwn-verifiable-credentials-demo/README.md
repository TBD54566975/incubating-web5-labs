## Issue Verifiable Credentials On A DWN

To run the demo simply run:
```
cd dwn-verifiable-credentials-demo
npm install
npm start
```

## Features
The application consists of the following sections:

- Connect to DWN: Allows users to connect to the Decentralized Web Network (DWN) and generate their own DIDs (Decentralized Identifiers).

- Issue Verifiable Credential: Lets users issue a Verifiable Credential (VC) by providing the issuer's public and private keys, and the credential subject. The issued VC is displayed in both JSON and JWT format.

- Send VC to a DWN: Allows users to send the issued VC to a DWN. The response is displayed in a formatted output box.

- Verify VC is Authentic: Users can verify if the VC is authentic by providing the VC JWT, issuer DID, and the issuer's well-known URL. The application will indicate whether the VC is valid or not.

- Verify VCs on DWN. Allows users to verify VCs stored on a DWN.

