/** @internal An ordered position reserved inside a destination. */
export interface Slot {
	start: Comment;
	priority: number;
	seq: number;
}

let seq = 0;
const reserved = new WeakMap<Element, Slot[]>();

/** A `to` string is a CSS selector when it starts like one, otherwise a name. */
const IS_SELECTOR = /^[#.[]/;

/**
 * Where content should go. Several elements can match one name, which is how a
 * single source feeds a mobile and a desktop destination at once. Anything
 * unresolvable falls back to the body layer rather than throwing.
 */
export function resolveTargets(to?: string | Element | null): Element[] {
	if (to instanceof Element) return [to];

	if (typeof to === 'string' && to !== '') {
		const selector = IS_SELECTOR.test(to) ? to : `[data-emplace="${to}"]`;
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

/** Give up a reserved position. Call it once the content's outro has finished. */
export function release(target: Element, slot: Slot): void {
	const list = reserved.get(target);
	const at = list?.indexOf(slot) ?? -1;
	if (list && at !== -1) list.splice(at, 1);
	slot.start.remove();
}
