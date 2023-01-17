import { createAPIPopup } from "/background/Popup.mjs";
import { permissionsStorage, profilesStorage } from "/background/Storage.mjs";
import { browser, sendToContentScript } from "/shared/js/Extension.mjs";

export async function handleAPI(messageId, { }, host, windowId, tabId, frameId, documentId) {
	let permissions = await permissionsStorage.get();
	let permission = permissions.find((permission) => permission.host === host);
	if (permission) {
		sendToContentScript(tabId, frameId, documentId, messageId, { isAllowed: permission.isAllowed });
		return;
	}

	createAPIPopup("DWNRequestAccess", { host }, messageId, windowId, tabId, frameId, documentId);
}

export async function handlePopup({ host, isAllowed }) {
	let profiles = await profilesStorage.get()
	let profile = profiles.find((profile) => profile.name === "default");
	await permissionsStorage.update((permissions) => {
		permissions.push({
			host,
			did: profile.did,
			isAllowed,
		});
		return permissions;
	});

	return { isAllowed };
}
