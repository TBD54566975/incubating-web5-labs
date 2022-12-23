import { popupStorage, profilesStorage } from "/background/Storage.mjs";
import * as web5 from "/background/web5/index.mjs";
import { takeFirstMatching } from "/shared/js/Array.mjs";
import { generateDID } from "/shared/js/DID.mjs";
import { browser, sendToContentScript } from "/shared/js/Extension.mjs";
import { getHost } from "/shared/js/URL.mjs";

async function handleAPI({ id, name, args }, sender) {
	const routes = {
		"web5.dwn.processMessage": web5.dwn.processMessage,
		"web5.dwn.requestAccess": web5.dwn.requestAccess,
	};

	if (!(name in routes))
		return;

	routes[name].handleAPI(id, args, getHost(sender.url), sender.tab.windowId, sender.tab.id, sender.frameId, sender.documentId);
}

async function handlePopup({ name, args }, sender) {
	const routes = {
		"DWNRequestAccess": web5.dwn.requestAccess,
	};

	if (!(name in routes))
		return;

	let popup = null;
	await popupStorage.update((popups) => {
		popup = takeFirstMatching(popups, (popup) => popup.popupId === sender.tab.windowId);
		return popups;
	});
	if (!popup) {
		console.assert(false, "not reached");
		return;
	}

	let result = await routes[name].handlePopup(args);

	await sendToContentScript(popup.tabId, popup.frameId, popup.documentId, popup.messageId, result);

	browser.windows.remove(popup.popupId);
}

chrome.runtime.onInstalled.addListener(() => {
	profilesStorage.update(async (identities) => {
		if (!identities.some((identity) => identity.name === "default")) {
			let { did, privateJWK, publicJWK } = await generateDID();
			identities.push({ name: "default", did, privateJWK, publicJWK });
		}
		return identities;
	});
});

browser.runtime.onMessage.addListener((message, sender) => {
	handleAPI(message, sender);
	handlePopup(message, sender);
});
