import type { Emplacement, EmplaceOptions, Input } from './internal.js';

let auto = 0;

/**
 * Create an emplacement: a typed handle that pairs `<In>` sources with `<Out>`
 * destinations. The handle *is* the identity, so there are no target selectors
 * to keep in sync.
 *
 * ```js
 * // src/lib/slots.js
 * import { emplace } from 'svelte-emplace';
 * export const pageTitle = emplace();
 * export const toolbar = emplace({ mode: 'multiple' });
 * ```
 *
 * Create these in a module so both sides import the same handle. For a
 * per-instance emplacement, call `emplace()` in a component and pass the handle
 * down as a prop or through context — it is a plain object.
 */
export function emplace(options: EmplaceOptions = {}): Emplacement {
	const { mode = 'single', key } = options;
	// `$state(...)` may only initialise a declaration, so it cannot be inlined
	// into the returned literal.
	const reg = $state({ inputs: [] as Input[] });

	return { id: key ?? `e${auto++}`, mode, reg };
}
