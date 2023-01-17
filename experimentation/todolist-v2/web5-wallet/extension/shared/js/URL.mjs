export function getHost(url) {
	if (!(url instanceof URL))
		url = new URL(url);
	return url.host;
}
