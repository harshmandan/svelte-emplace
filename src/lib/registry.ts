import type { Snippet } from 'svelte';

/** @internal One `<Emplace>` collected during a server render. */
export interface ServerInput {
	readonly name: string;
	readonly priority: number;
	readonly children: Snippet | undefined;
	readonly context: Map<unknown, unknown>;
}

export type ServerStore = ServerInput[];

// A lookup rather than the store itself: the server entry installs an
// AsyncLocalStorage accessor here, so `node:async_hooks` never reaches the client
// bundle and there is no module-level state to leak between requests.
let lookup: () => ServerStore | undefined = () => undefined;
let warned = false;

/** @internal Called by `svelte-emplace/server` to expose its request store. */
export function installStore(fn: () => ServerStore | undefined): void {
	lookup = fn;
}

/** @internal */
export function currentStore(): ServerStore | undefined {
	return lookup();
}

/** @internal Collect one `<Emplace>` rendered on the server. */
export function serverRegister(input: ServerInput): void {
	const store = lookup();

	if (!store) {
		if (!warned) {
			warned = true;
			console.warn(
				'[svelte-emplace] `to="@' +
					input.name +
					'"` was not server-rendered because no request store was found. Add the hook:\n\n' +
					"  // src/hooks.server.js\n  export { emplaceHandle as handle } from 'svelte-emplace/server';\n\n" +
					'Without it the content still appears, just after hydration.'
			);
		}
		return;
	}

	store.push(input);
}
