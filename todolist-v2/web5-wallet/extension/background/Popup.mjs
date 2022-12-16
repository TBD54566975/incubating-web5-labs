import { popupStorage } from "/background/Storage.mjs";
import { removeAllMatching } from "/shared/js/Array.mjs";
import { browser, sendToContentScript } from "/shared/js/Extension.mjs";
import { lazy } from "/shared/js/Lazy.mjs";

export async function createAPIPopup(name, params, messageId, windowId, tabId, frameId, documentId) {
	let lastFocusedWindow = await browser.windows.get(windowId);

	const width = 459;
	const height = 692;

	let url = new URL(browser.runtime.getURL(`/popups/${name}/index.html`));
	for (let key in params)
		url.searchParams.set(key, params[key]);

	let popup = await browser.windows.create({
		url: url.href,
		type: "popup",
		top: Math.round(lastFocusedWindow.top + (lastFocusedWindow.height / 2) - (height / 2)),
		left: Math.round(lastFocusedWindow.left + (lastFocusedWindow.width / 2) - (width / 2)),
		width,
		height,
		focused: true,
	});

	popupStorage.update((popups) => {
		popups.push({
			popupId: popup.id,
			tabId,
			frameId,
			documentId,
			messageId,
		});
		return popups;
	});
}

browser.tabs.onRemoved.addListener((tabId) => {
	popupStorage.update((popups) => {
		removeAllMatching(popups, (popup) => {
			if (popup.tabId === tabId) {
				browser.windows.remove(popup.popupId);
				return true;
			}

			return false;
		});
		return popups;
	});
});

browser.windows.onRemoved.addListener((windowId) => {
	popupStorage.update((popups) => {
		removeAllMatching(popups, (popup) => {
			if (popup.windowId === windowId) {
				browser.windows.remove(popup.popupId);
				return true;
			}

			if (popup.popupId === windowId) {
				sendToContentScript(popup.tabId, popup.frameId, popup.documentId, popup.messageId, new Error("CANCELLED"));
				return true;
			}

			return false;
		});
		return popups;
	});
});
