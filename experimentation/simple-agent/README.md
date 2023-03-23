# Simple Agent Local and Remote DWN Example

## Installation

To test with remote DWNs, start at least one of the test agents:

```shell
cd test-agent-8085/
npm install
npm run serve
```

This will start an agent running on `http://localhost:8085`.

If you want to test with multiple DWNs, start agents on local ports `8086` and `8087`.

## Usage

Open the `index.html` file in a web browser.  It is recommended you use Google Chrome since it has the most testing.

Right-click somewhere in the page and select **Inspect** and then open your **Console**.

When you refresh the page, you'll see the result of the writes and queries to the in-browser DWN.

If you have at least one of the `test-agent-808#` servers running, you'll also see the result of writing to the "remote"
DWNs.

** Note that if you have the agent running on port 8085 shut down but one on ports 8086 or 8087 are up, the message
will be successfully processed on the first one that is available.  First 8085 is tried, then 8086, and finally 8087.
Even though the message may be successfully processed on the port 8086 instance, your web browser will still report an
`ERR_CONNECTION_REFUSED` message as a result of first trying 8085 before moving on to 8086.  There is no way to disable
this error reporting in a browser.