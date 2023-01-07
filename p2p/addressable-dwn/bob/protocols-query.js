import { getDIDState, protocolsQuery, collectionsQuery } from "./utils.js";
import { ProtocolsQuery } from "@tbd54566975/dwn-sdk-js";

const bob = await getDIDState();
const result = await collectionsQuery(bob, { protocol: 'chat', schema: 'chat/thread' });
console.log(JSON.stringify(result, null, 4));