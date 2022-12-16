(function() {

let context = window;
let captured = {
	Crypto_prototype_randomUUID: context.Crypto.prototype.randomUUID,
	CustomEvent: context.CustomEvent,
	CustomEvent_prototype_get_detail: context.Object.getOwnPropertyDescriptor(context.CustomEvent.prototype, "detail").get,
	Event_prototype_preventDefault: context.Event.prototype.preventDefault,
	Event_prototype_stopImmediatePropagation: context.Event.prototype.stopImmediatePropagation,
	Event_prototype_stopPropagation: context.Event.prototype.stopPropagation,
	EventTarget_prototype_dispatchEvent: context.EventTarget.prototype.dispatchEvent,
	Map_prototype_delete: context.Map.prototype.delete,
	Map_prototype_get: context.Map.prototype.get,
	Map_prototype_set: context.Map.prototype.set,
	Reflect_apply: context.Reflect.apply,
	Reflect_construct: context.Reflect.construct,
	Object_prototype_hasOwnProperty: context.Object.prototype.hasOwnProperty,
	Promise: context.Promise,
	crypto: context.crypto,
}
function call(thisArgument, target, ...argumentsList) {
	return captured.Reflect_apply(target, thisArgument, argumentsList);
}
function construct(target, ...argumentsList) {
	return captured.Reflect_construct(target, argumentsList);
}
function getOwnProperty(target, propertyKey) {
	if (!call(target, captured.Object_prototype_hasOwnProperty, propertyKey))
		return undefined;
	return target[propertyKey];
}

if (getOwnProperty(context, "web5"))
	return;

let url = new URL(import.meta.url);
let seed = url.searchParams.get("seed");

let callbacks = new Map;
async function send(name, args) {
	return construct(captured.Promise, (resolve, reject) => {
		let messageId = call(crypto, captured.Crypto_prototype_randomUUID);

		call(callbacks, captured.Map_prototype_set, messageId, { resolve, reject });

		call(context, captured.EventTarget_prototype_dispatchEvent, construct(captured.CustomEvent, seed + "-out", {
			detail: {
				id: messageId,
				name,
				args,
			}
		}));
	});
}

context.addEventListener(seed + "-in", (event) => {
	let detail = call(event, captured.CustomEvent_prototype_get_detail);
	if (!detail)
		return;

	let id = getOwnProperty(detail, "id");
	if (!id)
		return;

	// Ignore outgoing messages. Incoming messages only have an `id` and `result`/`error`.
	if (getOwnProperty(detail, "name"))
		return;

	let callback = call(callbacks, captured.Map_prototype_get, id);
	if (!callback)
		return;

	call(event, captured.Event_prototype_preventDefault);
	call(event, captured.Event_prototype_stopImmediatePropagation);
	call(event, captured.Event_prototype_stopPropagation);

	call(callbacks, captured.Map_prototype_delete, id);

	let error = getOwnProperty(detail, "error");
	if (error) {
		callback.reject(error);
		return;
	}

	let result = getOwnProperty(detail, "result");
	if (result) {
		callback.resolve(result);
		return;
	}

	callback.resolve();
}, { capture: true, passive: true });

context.web5 ??= {
	dwn: {
		async processMessage(message) {
			return send("web5.dwn.processMessage", { message });
		},
		async requestAccess() {
			return send("web5.dwn.requestAccess", { });
		},
	},
};

})();
