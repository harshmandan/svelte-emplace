import type { Mode, ServerInput } from './internal.js';

export interface ServerEntry {
	mode: Mode;
	inputs: ServerInput[];
}

export type ServerStore = Map<string, ServerEntry>;

let lookup: () => ServerStore | undefined = () => undefined;
let warned = false;

/** @internal Called by the server entry to expose its request-scoped store. */
export function installStore(fn: () => ServerStore | undefined): void {
	lookup = fn;
}

/** @internal */
export function currentStore(): ServerStore | undefined {
	return lookup();
}

/** @internal Collect an `<In>` rendered on the server. */
export function serverRegister(id: string, mode: Mode, input: ServerInput): void {
	const store = lookup();

	if (!store) {
		if (!warned) {
			warned = true;
			console.warn(
				'[svelte-emplace] No server store found, so emplaced content was not ' +
					'server-rendered. Add `emplaceHandle` to your hooks:\n\n' +
					"  // src/hooks.server.js\n  export { emplaceHandle as handle } from 'svelte-emplace/hooks';\n\n" +
					'Content will still appear on the client after hydration.'
			);
		}
		return;
	}

	let entry = store.get(id);
	if (!entry) store.set(id, (entry = { mode, inputs: [] }));
	entry.inputs.push(input);
}
