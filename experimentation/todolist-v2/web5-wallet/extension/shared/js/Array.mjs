export function removeAllMatching(array, predicate) {
	console.assert(Array.isArray(array), array);
	console.assert(typeof predicate === "function", predicate);

	for (let i = 0; i < array.length; ++i) {
		if (predicate(array[i], i, array))
			array.splice(i--, 1);
	}
}

export function takeFirstMatching(array, predicate) {
	console.assert(Array.isArray(array), array);
	console.assert(typeof predicate === "function", predicate);

	for (let i = 0; i < array.length; ++i) {
		let item = array[i];
		if (predicate(item, i, array)) {
			array.splice(i--, 1);
			return item;
		}
	}
}
