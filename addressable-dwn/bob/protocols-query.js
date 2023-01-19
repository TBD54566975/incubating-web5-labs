import { getDIDState, protocolsQuery, recordsQuery } from "./utils.js";
import { ProtocolsQuery } from "@tbd54566975/dwn-sdk-js";

const bob = await getDIDState();
const result = await recordsQuery(bob, { protocol: 'chat', schema: 'chat/thread' });
console.log(JSON.stringify(result, null, 4));