import { parseDID } from "/shared/js/DID.mjs";

export { CollectionsQuery, CollectionsWrite, DWN as Instance } from "/external/bundle.mjs";

export function generateDWNSignature(did, privateJWK) {
	let { id } = parseDID(did);
	return {
		protectedHeader: {
			alg: privateJWK.alg,
			kid: `${did}#${id}`,
		},
		jwkPrivate: privateJWK,
	};
}
