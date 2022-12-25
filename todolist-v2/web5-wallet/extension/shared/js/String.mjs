export function substitute(template, substitutions, combine) {
	console.assert(typeof template === "string", template);
	console.assert(typeof substitutions === "object", substitutions);
	console.assert(typeof combine === "function", combine);

	let substitute = false;
	for (let part of template.split(/(%)(.+?)(%)/)) {
		if (part === "%")
			substitute = !substitute;
		else if (substitute)
			combine(substitutions[part]);
		else
			combine(part);
	}
}
