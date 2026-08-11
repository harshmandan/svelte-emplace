/** Attribute marking a destination, and the wrapper around a server-rendered copy. */
export const NAME_ATTR = 'data-emplace';
// Comments, not an element: a wrapper <div> is invalid inside phrasing content
// like <p>, so the parser hoists it out of the destination — taking the server
// copy with it and splitting the paragraph. Comments are valid anywhere.
export const SSR_OPEN = 'emplace:ssr';
export const SSR_CLOSE = '/emplace:ssr';

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

/**
 * The name in `to="@name"`, or null when `to` is a CSS selector. CSS reserves
 * `@` for at-rules, so no selector can ever start with it — which means every
 * other string can go straight to `querySelector`, tag names included.
 */
export function emplaceName(to: string): string | null {
	return to.startsWith('@') ? to.slice(1) : null;
}

/**
 * Where content should go. `multiple` returns every element `to` matches, which
 * is how one source feeds a mobile and a desktop destination at once. Anything
 * unresolvable falls back to the body layer rather than throwing.
 */
export function resolveTargets(to?: string | Element | null, multiple = false): Element[] {
	if (isElement(to)) return [to];

	if (typeof to === 'string' && to !== '') {
		const name = emplaceName(to);
		let found: NodeListOf<Element> | null = null;

		try {
			found = document.querySelectorAll(name === null ? to : `[${NAME_ATTR}="${name}"]`);
		} catch {
			// An invalid selector is unresolvable, same as one that matches nothing.
			warnUnresolved(to, 'is not a valid selector');
		}

		if (found) {
			if (found.length > 0) return multiple ? Array.from(found) : [found[0]];
			warnUnresolved(to, 'matched no element');
		}
	}

	return [bodyLayer()];
}

const warnedFor = new Set<string>();

/**
 * A destination that has gone missing is not fatal — the content still renders,
 * in the body layer — but it is nearly always a renamed element or a typo, and
 * the only other symptom is content quietly appearing in the wrong place. Once
 * per distinct `to`, so a target that only resolves later does not repeat.
 */
function warnUnresolved(to: string, reason: string): void {
	if (warnedFor.has(to)) return;
	warnedFor.add(to);

	console.warn(
		`[svelte-emplace] \`to="${to}"\` ${reason}, so the content is in the <body> layer instead. ` +
			'If the destination mounts later than the content, that is expected: `to` is resolved once.'
	);
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
	let removing = false;

	for (const node of [...target.childNodes]) {
		if (node.nodeType === 8) {
			const data = (node as Comment).data;

			if (data === SSR_OPEN) {
				removing = true;
				node.remove();
				continue;
			}

			if (data === SSR_CLOSE) {
				node.remove();
				removing = false;
				continue;
			}
		}

		if (removing) node.remove();
	}
}

/** Give up a reserved position. Call it once the content's outro has finished. */
export function release(target: Element, slot: Slot): void {
	const list = reserved.get(target);
	const at = list?.indexOf(slot) ?? -1;
	if (list && at !== -1) list.splice(at, 1);
	slot.start.remove();
}
