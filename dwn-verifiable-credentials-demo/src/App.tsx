import React, { useState } from 'react';
import { Container, TextField, Button, Box, Typography } from '@mui/material';
import styled from '@emotion/styled';
import { Global, css } from '@emotion/react';
import { Web5 } from '@tbd54566975/web5'

const Background = styled(Container)`
  background-color: #ffec19;
  height: 130vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const FormBox = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const OutputBox = styled(Box)`
  margin-top: 2rem;
  border: 1px solid black;
  padding: 1rem;
  word-wrap: break-word;
`;

const WrappedTextBox = styled(Box)`
  width: 900px;
  word-wrap: break-word;
  white-space: pre-wrap;
  overflow: auto;
  border: 1px solid black;
  padding: 1rem;
 
`;

const web5 = new Web5();

function App() {
  // DWN
  const [dwnDID, setDWNDID] = useState('');
  const [dwnWriteResult, setDWNWriteResult] = useState({} as any);

  // VC ISSUANCE
  const [issuerPublicKey, setIssuerPublicKey] = useState("did:key:z6Mkuxr8y6uyaze1UoXXGHhuZBcuon8yiNEh12Hh85V8hEx4");
  const [issuerPrivateKey, setIssuerPrivateKey] = useState('5kBPXRJpznydNAj2F7DHr2HSx72VTSGrrx8nuce9zgCKBFFs7gQH1WoiZ3Q9KudY3TefDbhs9QmEUW2iCXayowh6');
  const [credentialSubject, setCredentialSubject] = useState('{"id": "did:key:z6Mkq7pU15BB27viF9JjkbXAqPBecGDB7H9NxYG5L4m2UVrV", "web5OG": true}');
  const [vcOutput, setVCOutput] = useState('');
  const [vcJWTOutput, setVCJWTOutput] = useState('');

  // VC VALIDATION
  const [wellknownURL, setWellknownURL] = useState('https://www.tbd.website/.well-known/did-configuration.json');
  const [issuerDidToValidateAgainst, setIssuerDidToValidateAgainst] = useState('did:key:z6Mkuxr8y6uyaze1UoXXGHhuZBcuon8yiNEh12Hh85V8hEx4');
  const [validJWTVC, setValidJWTVC] = useState(false);
  const [validDWNVC, setValidDWNVC] = useState(false);


  const initDWN = async () => {
    const myDid = await web5.did.create('ion');

    web5.did.register({
      connected: true,
      did: myDid.id,
      endpoint: 'app://dwn',
      keys: myDid.keys[0].keypair
    });

    updateSubject(myDid.id)
    setDWNDID(myDid.id)
  }

  // TODO: SSI Needs to support SECP256k1 to be able to use this
  const initDWNBringYourOwnKey = async () => {
    const myDidSSI = await window.createDIDKey()
    const keypair =
    {
      id: "key-1",
      type: "JsonWebKey2020",
      keypair: {
        publicJwk: myDidSSI.publicJWK,
        privateJwk: myDidSSI.privateJWK
      },
      purposes: [
        "authentication"
      ]
    }

    web5.did.register({
      connected: true,
      did: myDidSSI.didDocument.id,
      endpoint: 'app://dwn',
      keys: keypair
    });

    updateSubject(myDidSSI.didDocument.id)
    setDWNDID(myDidSSI.didDocument.id)
  }

  const updateSubject = async (did: string) => {
    let subject = { "id": "did:key:z6Mkq7pU15BB27viF9JjkbXAqPBecGDB7H9NxYG5L4m2UVrV", "web5OG": true }
    subject.id = did
    console.log(subject)
    setCredentialSubject(JSON.stringify(subject, null, 2))
  }

  const handleIssueVC = () => {
    const result = window.createVerifiableCredential(issuerPublicKey, issuerPrivateKey, credentialSubject);
    console.log(result)
    setVCOutput(JSON.stringify(result.vc, null, 2));
    setVCJWTOutput(JSON.stringify(result.vcJWT, null, 2).replaceAll('"', ''));
  };

  const recordWrite = async (data: any) => {
    const writeResponse = await web5.dwn.records.write(dwnDID, {
      author: dwnDID,
      data: data,
      message: {
        schema: 'my/vcs',
        dataFormat: 'text/plain'
      }
    });

    console.log('\nWRITE RESPONSE:', writeResponse);
    setDWNWriteResult(writeResponse)
  }

  const recordQuery = async () => {
    // Query for the record that was just created.
    const queryResponse = await web5.dwn.records.query(dwnDID, {
      author: dwnDID,
      message: {
        filter: {
          schema: 'my/vcs'
        }
      }
    });

    console.log("DWN Response:", queryResponse)

    const dwnVCJWT = base64UrlToString(queryResponse.entries[0].encodedData)
    const result = await window.verifyJWTCredential(dwnVCJWT, issuerDidToValidateAgainst);
    setValidDWNVC(result)
  }

  const base64UrlToString = (encodedData: any) => {
    return web5.dwn.SDK.Encoder.bytesToString(web5.dwn.SDK.Encoder.base64UrlToBytes(encodedData));
  }


  const handleVerifyVCJWT = async (vcJWTOutput: string, issuerDidToValidateAgainst: string) => {
    // TODO: To get wellknown from the website directly but we have a cors issue
    // fetch(wellknownURL)
    //   .then(response => response.json())
    //   .then(data => console.log(data));

    const result = await window.verifyJWTCredential(vcJWTOutput, issuerDidToValidateAgainst);
    setValidJWTVC(result)
  };

  return (
    <div style={{ backgroundColor: "black" }}>
      <Global
        styles={css`
        body {
          font-family: 'IBM Plex Mono', monospace;
        }
      `}
      />

      <Background>
        <FormBox>
          <h1 style={{ textAlign: "center", color: "black" }}>Connect to DWN</h1>

          <Button
            variant="contained"
            color="primary"
            style={{ backgroundColor: '#9a1aff' }}
            onClick={e => initDWN()}
          >
            Start DWN
          </Button>

          <WrappedTextBox>
            <p style={{ fontSize: 10 }}>{dwnDID}</p>
          </WrappedTextBox>

        </FormBox>
      </Background>

      <hr></hr>

      <Background>
        <FormBox>
          <h1 style={{ textAlign: "center", color: "black" }}>Issue Verifiable Credential</h1>

          <TextField
            label="Issuer DID"
            variant="outlined"
            value={issuerPublicKey}
            onChange={(e) => setIssuerPublicKey(e.target.value)}
          />
          <TextField
            label="Issuer Private Key"
            variant="outlined"
            value={issuerPrivateKey}
            onChange={(e) => setIssuerPrivateKey(e.target.value)}
          />
          <TextField
            label="Credential Subject"
            variant="outlined"
            value={credentialSubject}
            onChange={(e) => setCredentialSubject(e.target.value)}
          />

          <WrappedTextBox>
            <p style={{ fontSize: 10 }}>{credentialSubject}</p>
          </WrappedTextBox>

          <Button
            variant="contained"
            color="primary"
            style={{ backgroundColor: '#9a1aff' }}
            onClick={handleIssueVC}
          >
            Issue VC
          </Button>

          {vcOutput && (
            <WrappedTextBox>
              <p style={{ fontSize: 10 }}>{vcOutput}</p>
            </WrappedTextBox>
          )}

          {vcJWTOutput && (
            <WrappedTextBox>
              <p style={{ fontSize: 10 }}>{vcJWTOutput}</p>
            </WrappedTextBox>
          )}

        </FormBox>
      </Background>

      <hr></hr>

      <Background>
        <FormBox>
          <h1 style={{ textAlign: "center", color: "black" }}>Send VC to a DWN</h1>

          <Button
            variant="contained"
            color="primary"
            style={{ backgroundColor: '#9a1aff' }}
            onClick={e => recordWrite(vcJWTOutput)}
          >
            Send to DWN
          </Button>

          {dwnWriteResult && (
            <OutputBox>
              <Typography component="pre" style={{ fontSize: '1rem', color: 'black' }}>
                {JSON.stringify(dwnWriteResult)}
              </Typography>
            </OutputBox>
          )}

        </FormBox>
      </Background>

      <hr></hr>

      <Background>
        <FormBox>
          <h1 style={{ textAlign: "center", color: "black" }}>Verify VC is Authentic</h1>

          <TextField
            disabled={true}
            label="Issuer Website Wellknown URL"
            variant="outlined"
            value={wellknownURL}
            onChange={(e) => setWellknownURL(e.target.value)}
          />

          <TextField
            label="vcJWT"
            variant="outlined"
            value={vcJWTOutput.replace('"', '')}
            onChange={(e) => setVCJWTOutput(e.target.value.replaceAll('"', ''))}
          />

          <TextField
            label="Issuer DID to validate against"
            variant="outlined"
            value={issuerDidToValidateAgainst}
            onChange={(e) => setIssuerDidToValidateAgainst(e.target.value)}
          />

          <Button
            variant="contained"
            color="primary"
            style={{ backgroundColor: '#9a1aff' }}
            onClick={(e) => handleVerifyVCJWT(vcJWTOutput.replaceAll('"', ''), issuerDidToValidateAgainst)}
          >
            Verify VC JWT
          </Button>

          <OutputBox>
            VC IS Valid?
            <Typography component="pre" style={{ fontSize: '1rem', color: 'green' }}>
              {validJWTVC + ""}
            </Typography>
          </OutputBox>

        </FormBox>
      </Background>

      <hr></hr>

      <Background>
        <FormBox>
          <h1 style={{ textAlign: "center", color: "black" }}>Verify VC on DWN is Authentic</h1>
          <TextField
            disabled={true}
            label="Issuer Website Wellknown URL"
            variant="outlined"
            value={wellknownURL}
            onChange={(e) => setWellknownURL(e.target.value)}
          />

          <TextField
            label="Issuer DID to validate against"
            variant="outlined"
            value={issuerDidToValidateAgainst}
            onChange={(e) => setIssuerDidToValidateAgainst(e.target.value)}
          />

          <Button
            variant="contained"
            color="primary"
            style={{ backgroundColor: '#9a1aff' }}
            onClick={e => recordQuery()}
          >
            Verify VC On DWN
          </Button>

          <OutputBox>
            VC On DWN IS Valid?
            <Typography component="pre" style={{ fontSize: '1rem', color: 'green' }}>
              {validDWNVC + ""}
            </Typography>
          </OutputBox>
        </FormBox>
      </Background>

      <hr></hr>
      <a href="https://www.tbd.website/.well-known/did-configuration.json">TBD DID Wellknown Config</a>
    </div>
  );
}

export default App;