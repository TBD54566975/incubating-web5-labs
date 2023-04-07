let seed = crypto.randomUUID();

let browser = globalThis.browser ?? globalThis.chrome;
let context = window;

context.addEventListener(seed + "-out", (event) => {
	if (!event.detail?.name?.startsWith?.("web5."))
		return;

	event.preventDefault();
	event.stopImmediatePropagation();
	event.stopPropagation();

	browser.runtime.sendMessage(event.detail);
}, { capture: true, passive: true });

browser.runtime.onMessage.addListener((message) => {
	context.dispatchEvent(new CustomEvent(seed + "-in", { detail: message }));
});

function injectScript(src) {
	let script = document.createElement("script");
	script.setAttribute("src", src);
	script.setAttribute("type", "module")
	document.documentElement.appendChild(script);

	script.remove();
}

injectScript(browser.runtime.getURL(`/content_scripts/web5.js?seed=${seed}`));
