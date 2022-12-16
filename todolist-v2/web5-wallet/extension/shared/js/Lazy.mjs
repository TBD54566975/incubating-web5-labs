export function lazy(creator) {
	console.assert(typeof creator === "function", creator);

	let instance = null;
	return function() {
		instance ??= creator();
		return instance;
	};
}
