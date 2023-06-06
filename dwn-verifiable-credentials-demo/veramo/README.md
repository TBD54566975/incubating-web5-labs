# Web5 Issue VC Demo


This project is a demonstration of a user buying a product, and then receiving a Verifiable Credential from the store owner, verifying the purchase. The Verifiable Credential can then be verified for authenticity and the user can gain exclusive access to new content.

The codebase contains two main directories:

* react: Contains the React.js frontend code for the user interface.
* nodejs: Contains the Node.js backend server code.





## React
Navigate into the react directory and run the following commands:
```
cd react
npm install
npm run dev
```

## NodeJs
Similarly, navigate into the nodejs directory and run the following commands:
```
cd nodejs
npm install
npm start
```

## Running the Demo
Once both servers are running, navigate to the react webpage and click the "Buy" button. This action triggers an API call to the /buy endpoint on the backend server, which creates a Verifiable Credential for the user. The subject of the Verifiable Credential is the user's DID and it gives the VC of "verified buyer"