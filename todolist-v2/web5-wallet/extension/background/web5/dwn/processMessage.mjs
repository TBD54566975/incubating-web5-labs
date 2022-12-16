import { getDWN, permissionsStorage, profilesStorage } from "/background/Storage.mjs";
import { CollectionsQuery, CollectionsWrite, generateDWNSignature} from "/shared/js/DWN.mjs";
import { sendToContentScript } from "/shared/js/Extension.mjs";

export async function handleAPI(messageId, { message }, host, windowId, tabId, frameId, documentId) {
	let permissions = await permissionsStorage.get();
	let permission = permissions.find((permission) => permission.host === host);
	if (!permission?.isAllowed) {
		sendToContentScript(tabId, frameId, documentId, messageId, new Error("ACCESS_FORBIDDEN"));
		return;
	}

	switch (message.method) {
	case "CollectionsQuery": {
		let profiles = await profilesStorage.get();
		let profile = profiles.find((profile) => profile.did === permission.did);

		let collectionsQuery = await CollectionsQuery.create({
			...message.options,
			target: profile.did,
			signatureInput: generateDWNSignature(profile.did, profile.privateJWK),
		});

		let dwn = await getDWN();
		let result = await dwn.processMessage(collectionsQuery.toJSON());
		sendToContentScript(tabId, frameId, documentId, messageId, result);
		return;
	}

	case "CollectionsWrite": {
		if (message.data) {
			switch (message.options.dataFormat) {
			case "application/json":
				message.options.data = (new TextEncoder).encode(JSON.stringify(message.data));
				break;

			default:
				sendToContentScript(tabId, frameId, documentId, messageId, new Error("UNKNOWN_DATAFORMAT"));
				return;
			}
		}

		let profiles = await profilesStorage.get();
		let profile = profiles.find((profile) => profile.did === permission.did);

		let collectionsWrite = await CollectionsWrite.create({
			...message.options,
			target: profile.did,
			signatureInput: generateDWNSignature(profile.did, profile.privateJWK),
		});

		let dwn = await getDWN();
		let result = await dwn.processMessage(collectionsWrite.toJSON());
		sendToContentScript(tabId, frameId, documentId, messageId, {
			record: collectionsWrite.toJSON(),
			result,
		});
		return;
	}

	default:
		sendToContentScript(tabId, frameId, documentId, messageId, new Error("UNKNOWN_METHOD"));
		return;
	}
}
