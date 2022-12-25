export let browser = globalThis.browser ?? globalThis.chrome;

export function localizeHTML() {
	document.body.setAttribute("dir", browser.i18n.getMessage("@@bidi_dir"));

	for (let node of document.querySelectorAll("[data-localize]")) {
		for (let config of node.dataset.localize.split(",")) {
			let [ propertyToLocalize, messageKey ] = config.split("=");
			node[propertyToLocalize] = browser.i18n.getMessage(messageKey || node[propertyToLocalize]);
		}
		delete node.dataset.localize;
	}
}

export function sendToBackgroundScript(name, args) {
	console.assert(typeof name === "string", name);
	console.assert(typeof args === "object" && args, args);

	return browser.runtime.sendMessage({ name, args });
}

export function sendToContentScript(tabId, frameId, documentId, messageId, value) {
	console.assert(!isNaN(tabId), tabId);
	console.assert(!isNaN(frameId), frameId);
	console.assert(typeof documentId === "string", documentId);
	console.assert(typeof messageId === "string", messageId);

	let message = { id: messageId };

	if (value instanceof Error)
		message.error = value.message;
	else if (value !== undefined)
		message.result = value;

	return browser.tabs.sendMessage(tabId, message, { frameId, documentId });
}
