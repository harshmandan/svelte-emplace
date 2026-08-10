/** Attribute marking a destination, and the wrapper around a server-rendered copy. */
export const NAME_ATTR = 'data-emplace';
export const SSR_ATTR = 'data-emplace-ssr';

/** @internal An ordered position reserved inside a destination. */
export interface Slot {
	start: Comment;
	priority: number;
	seq: number;
}

let seq = 0;
const reserved = new WeakMap<Element, Slot[]>();

/**
 * `instanceof Element` is false for a node from another window — an iframe has its
 * own copy of the constructor — so an element target from one would silently fall
 * through to the body layer. Check the node type instead.
 */
function isElement(value: unknown): value is Element {
	return typeof value === 'object' && value !== null && (value as Node).nodeType === 1;
}

/** A `to` string is a CSS selector when it starts like one, otherwise a name. */
const IS_SELECTOR = /^[#.[]/;

/**
 * Where content should go. Several elements can match one name, which is how a
 * single source feeds a mobile and a desktop destination at once. Anything
 * unresolvable falls back to the body layer rather than throwing.
 */
export function resolveTargets(to?: string | Element | null): Element[] {
	if (isElement(to)) return [to];

	if (typeof to === 'string' && to !== '') {
		const selector = IS_SELECTOR.test(to) ? to : `[${NAME_ATTR}="${to}"]`;
		const found = document.querySelectorAll(selector);
		if (found.length > 0) return Array.from(found);
	}

	return [bodyLayer()];
}

let layer: Element | null = null;

/** A single shared container at the end of `<body>`, created on first use. */
function bodyLayer(): Element {
	if (layer?.isConnected) return layer;

	layer = document.querySelector('[data-emplace-layer]');

	if (!layer) {
		layer = document.createElement('div');
		layer.setAttribute('data-emplace-layer', '');
		document.body.append(layer);
	}

	return layer;
}

/**
 * Reserve an ordered position in `target`. Each slot's content sits between its
 * own comment and the next slot's, so DOM order follows `priority` — ties
 * following registration order — regardless of what order things mount in.
 * Returns the node to mount before; `undefined` means append.
 */
export function claim(target: Element, priority: number): { slot: Slot; anchor: Node | undefined } {
	let list = reserved.get(target);
	if (!list) reserved.set(target, (list = []));

	const slot: Slot = { start: document.createComment(''), priority, seq: ++seq };

	const at = list.findIndex((s) => s.priority < priority);
	const index = at === -1 ? list.length : at;
	const following = list[index];

	target.insertBefore(slot.start, following ? following.start : null);
	list.splice(index, 0, slot);

	return { slot, anchor: following?.start };
}

/**
 * Remove the copy the server rendered into `target`, once the live content has
 * mounted alongside it. Called on mount, in the same flush, so there is no frame
 * where both or neither are visible.
 */
export function dropServerCopy(target: Element): void {
	target.querySelector(`:scope > [${SSR_ATTR}]`)?.remove();
}

/** Give up a reserved position. Call it once the content's outro has finished. */
export function release(target: Element, slot: Slot): void {
	const list = reserved.get(target);
	const at = list?.indexOf(slot) ?? -1;
	if (list && at !== -1) list.splice(at, 1);
	slot.start.remove();
}
