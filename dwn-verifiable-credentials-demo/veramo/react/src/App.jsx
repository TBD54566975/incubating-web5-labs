import { useState } from "react";
import { Web5 } from "@tbd54566975/web5";

import "./App.css";

const { web5, did: myDid } = await Web5.connect();

function App() {
  const [web5VCRecord, setWeb5VCRecord] = useState("");
  const [vc, setVC] = useState("");

  const purchaseItem = async () => {
    const url = "http://localhost:3000/buy";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ did: myDid }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const jsonResponse = await response.json();
      console.log(jsonResponse);

      // Store VC in Web5 DWN
      const { record } = await web5.dwn.records.create({
        store: false,
        data: JSON.stringify(jsonResponse),
        message: {
          dataFormat: "text/plain",
        },
      });

      console.log(record);

      setVC(JSON.stringify(jsonResponse));
      setWeb5VCRecord(JSON.stringify(record));

      return jsonResponse;
    } catch (error) {
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );
    }
  };

  return (
    <>
      <div>
        <h1> WEB5 Issue VC Flow </h1>
        <p> This demo shows how a user can buy a product, and then get a Verifiable Credential from the store owner verifiying that they purchased the product. The Verifiable Credential can then be verified to be authentic and allow the user to gain exclusive access to new content.</p>
      </div>

      <div className="card">
        <p>My Decentralized Identifier:</p>
        <div
          style={{
            width: "600px",
            height: "40px",
            overflow: "auto",
            border: "1px solid black",
            padding: "10px",
            fontSize: "12px",
            margin: '0 auto'
          }}
        >
          <p>{myDid}</p>
        </div>
      </div>



      <div className="card">
        <p>My Verifiable Credential DWN Record:</p>
        <div
          style={{
            width: "600px",
            height: "60px",
            overflow: "auto",
            border: "1px solid black",
            padding: "10px",
            fontSize: "12px",
            margin: '0 auto'
          }}
        >
          <p>{web5VCRecord}</p>
        </div>

        <p>My Verifiable Credential:</p>
        <div
          style={{
            width: "600px",
            height: "100px",
            overflow: "auto",
            border: "1px solid black",
            padding: "10px",
            fontSize: "12px",
            margin: '0 auto'
          }}
        >
          <p>{vc}</p>
        </div>
      </div>

      <div className="card">
        <button onClick={() => purchaseItem(true)}>
          {vc != "" ? "Purchased" : "Buy Product"}
        </button>
      </div>

      <a href="https://developer.tbd.website/" target="_blank" rel="noreferrer">
        Click to learn more about Web5
      </a>
    </>
  );
}

export default App;
