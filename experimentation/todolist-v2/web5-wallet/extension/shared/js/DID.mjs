import { base58btc, base64url, ed25519, getPublicKey, varint } from "/external/bundle.mjs";

let ED25519_CODEC_ID = varint(parseInt("0xed", 16));

export async function generateDID() {
	let privateKeyBytes = ed25519.randomPrivateKey();
	let publicKeyBytes = await getPublicKey(privateKeyBytes);

	let idBytes = new Uint8Array(publicKeyBytes.byteLength + ED25519_CODEC_ID.length);
	idBytes.set(ED25519_CODEC_ID, 0);
	idBytes.set(publicKeyBytes, ED25519_CODEC_ID.length);

	let id = base58btc.encode(idBytes);
	let did = `did:key:${id}`;
	let keyId = `${did}#${id}`;
	let publicJWK = {
		alg: "EdDSA",
		crv: "Ed25519",
		kid: keyId,
		kty: "OKP",
		use: "sig",
		x: base64url.baseEncode(publicKeyBytes)
	};
	let privateJWK = {
		...publicJWK,
		d: base64url.baseEncode(privateKeyBytes),
	};
	return { did, publicJWK, privateJWK };
}

export function parseDID(did) {
	let [ scheme, method, id ] = did.split(":");
	return { scheme, method, id };
}

export function resolveDID(did) {
	let { scheme, method, id } = parse(did);

	if (scheme !== "did")
		throw new Error("malformed scheme");

	if (method !== "key")
		throw new Error("did method MUST be \"key\"");

	let keyId = `${did}#${id}`;
	return {
		"@context": [
			"https://www.w3.org/ns/did/v1",
			"https://w3id.org/security/suites/ed25519-2020/v1",
			"https://w3id.org/security/suites/x25519-2020/v1",
		],
		"id": did,
		"verificationMethod": [
			{
				id: keyId,
				type: "JsonWebKey2020",
				controller: did,
				publicKeyJwk: {
					alg: "EdDSA",
					crv: "Ed25519",
					kty: "OKP",
					use: "sig",
					x: base64url.baseEncode(base58btc.decode(id).slice(ED25519_CODEC_ID.length)),
				},
			},
		],
		"authentication": [ keyId ],
		"assertionMethod": [ keyId ],
		"capabilityDelegation": [ keyId ],
		"capabilityInvocation": [ keyId ],
	};
}
