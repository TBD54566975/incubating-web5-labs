import { Instance } from "/shared/js/DWN.mjs";
import { browser } from "/shared/js/Extension.mjs";
import { lazy } from "/shared/js/Lazy.mjs";

export let getDWN = lazy(async () => Instance.create({ }));

class StorageQueue {
	static #unset = Symbol("unset");
	#store;
	#key;
	#value = StorageQueue.#unset;
	#fallback;
	#promise = Promise.resolve();

	constructor(key, fallback, { persist } = { }) {
		this.#store = persist ? browser.storage.local : browser.storage.session;
		this.#key = key;
		this.#fallback = fallback;
	}

	async get() {
		return this.#enqueue(async () => {
			if (this.#value === StorageQueue.#unset)
				await this.#load();
			return this.#value;
		});
	}

	async update(callback) {
		console.assert(typeof callback === "function", callback);

		return this.#enqueue(async () => {
			if (this.#value === StorageQueue.#unset)
				await this.#load();
			this.#value = await callback(this.#value);
			await this.#store.set({ [this.#key]: this.#value });
		});
	}

	async #load() {
		console.assert(this.#value === StorageQueue.#unset);

		let wrapper = await this.#store.get({ [this.#key]: this.#fallback });
		this.#value = wrapper[this.#key];
	}

	async #enqueue(operation) {
		let promise = this.#promise;
		this.#promise = new Promise((resolve, reject) => {
			promise.finally(() => operation().then(resolve, reject));
		});
		return this.#promise;
	}
}
export let permissionsStorage = new StorageQueue("permissions", [ ], { persist: true });
export let popupStorage = new StorageQueue("popup", [ ]);
export let profilesStorage = new StorageQueue("profiles", [ ], { persist: true });
