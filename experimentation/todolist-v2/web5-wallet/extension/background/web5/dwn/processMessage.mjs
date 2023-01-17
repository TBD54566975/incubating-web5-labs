import { getDWN, permissionsStorage, profilesStorage } from "/background/Storage.mjs";
import { CollectionsQuery, CollectionsWrite, generateDWNSignature } from "/shared/js/DWN.mjs";
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
			let signatureInput = generateDWNSignature(profile.did, profile.privateJWK);
			let createInput = {
				...message.options,
				target: profile.did,
				signatureInput
			}

			let collectionsQuery = await CollectionsQuery.create(createInput);

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

			let collectionsWrite;
			// if this is the lineage root
			if (message.lineageParent === undefined) {
				let collectionsWriteOptions = {
					...message.options,
					target: profile.did,
					signatureInput: generateDWNSignature(profile.did, profile.privateJWK),
				};
				console.log('CollectionsWriteOptions:');
				console.log(collectionsWriteOptions);

				collectionsWrite = await CollectionsWrite.create(collectionsWriteOptions);
			} else { // this is a lineage child
				let lineageChildCollectionsWriteOptions = {
					target: profile.did,
					lineageParent: message.lineageParent.recordId, // hardcode to the recordId, this is technically wrong but works in this POC because we have not utilized "delete"
					unsignedLineageParentMessage: message.lineageParent,
					...message.options,
					signatureInput: generateDWNSignature(profile.did, profile.privateJWK),
				};
				console.log('LineageChildCollectionsWriteOptions:');
				console.log(lineageChildCollectionsWriteOptions);

				collectionsWrite = await CollectionsWrite.createLineageChild(lineageChildCollectionsWriteOptions)
			}

			let collectionsWriteMessage = collectionsWrite.toJSON();
			console.log('CollectionsWrite:');
			console.log(collectionsWriteMessage);

			let dwn = await getDWN();
			let result = await dwn.processMessage(collectionsWriteMessage);
			console.log('CollectionsWrite result:');
			console.log(result);

			sendToContentScript(tabId, frameId, documentId, messageId, {
				record: collectionsWriteMessage,
				result,
			});
			return;
		}

		default:
			sendToContentScript(tabId, frameId, documentId, messageId, new Error("UNKNOWN_METHOD"));
			return;
	}
}
