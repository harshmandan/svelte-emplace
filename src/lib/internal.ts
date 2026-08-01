import type { Snippet } from 'svelte';

export type Mode = 'single' | 'multiple';

export interface Input {
	readonly seq: number;
	readonly priority: number;
	readonly children: Snippet | undefined;
}

/** @internal An `<In>` collected during SSR, plus the context it was authored in. */
export interface ServerInput extends Input {
	readonly context: Map<unknown, unknown>;
}

export interface Emplacement {
	/** Stable id. Only used to key the server-rendered anchor. */
	readonly id: string;
	readonly mode: Mode;
	/** @internal Client-side registry, shared between `<In>` and `<Out>`. */
	readonly reg: { inputs: Input[] };
}

export interface EmplaceOptions {
	/**
	 * `'single'` (default) renders only the winning `<In>` — highest `priority`,
	 * ties broken by most recently registered. `'multiple'` renders all of them,
	 * ordered by `priority` then registration order.
	 */
	mode?: Mode;
	/** Stable key for the server anchor. Defaults to an auto-incrementing id. */
	key?: string;
}

let seq = 0;

/** Monotonic app-wide, so a newly registered input always outranks an older one. */
export function nextSeq(): number {
	return ++seq;
}

/**
 * Which inputs an outlet should render, in order. Recomputed from the live set
 * on every change, so teardown churn during navigation can never leave a stale
 * winner behind.
 */
export function pick<T extends Input>(inputs: readonly T[], mode: Mode): T[] {
	if (inputs.length === 0) return [];

	if (mode === 'multiple') {
		return [...inputs].sort((a, b) => b.priority - a.priority || a.seq - b.seq);
	}

	let win = inputs[0];
	for (const c of inputs) {
		if (c.priority > win.priority || (c.priority === win.priority && c.seq > win.seq)) win = c;
	}
	return [win];
}

export const OUT_ATTR = 'data-emplace-out';
export const SSR_ATTR = 'data-emplace-ssr';
