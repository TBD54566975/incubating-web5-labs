import { browser, localizeHTML, sendToBackgroundScript } from "/shared/js/Extension.mjs";
import { removeChildren } from "/shared/js/HTML.mjs";
import { substitute } from "/shared/js/String.mjs";

localizeHTML();

let url = new URL(location.href);
let host = url.searchParams.get("host");

let hostElement = document.createElement("strong");
hostElement.textContent = host;

let descriptionElement = document.getElementById("description");
removeChildren(descriptionElement);
substitute(browser.i18n.getMessage("DWNRequestAccess_description"), { host: hostElement }, (item) => {
	descriptionElement.append(item);
});

document.getElementById("allow").addEventListener("click", (event) => {
	sendToBackgroundScript("DWNRequestAccess", { host, isAllowed: true });
});

document.getElementById("deny").addEventListener("click", (event) => {
	sendToBackgroundScript("DWNRequestAccess", { host, isAllowed: false });
});
