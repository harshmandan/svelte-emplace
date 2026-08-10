import { claim, release, resolveTargets } from './internal.js';

/**
 * Attachment counterpart to `<Emplace>`, for a single element you already have:
 *
 * ```svelte
 * <div class="tip" {@attach emplace('tips')}>…</div>
 * ```
 *
 * `to` and `priority` mean the same as on the component, and ordering is shared
 * with it. Two differences follow from being an attachment. The element is
 * created in place and *moved* to its destination — an attachment only receives
 * an element that already exists — so content that a move resets (iframes,
 * video, a focused input) belongs in the component. And one node can only be in
 * one place, so when several elements match a name, the first match is used.
 *
 * `{@attach}` needs Svelte 5.29.
 */
export function emplace(to?: string | Element | null, priority = 0) {
	return (node: Element): (() => void) => {
		const target = resolveTargets(to)[0];
		const { slot, anchor } = claim(target, priority);
		target.insertBefore(node, anchor ?? null);

		// Svelte removes the node itself, wherever it is — after the outro, if one
		// is playing — so only the reserved position needs giving back. When `to`
		// changes, this runs first and the re-run above moves the node on.
		return () => release(target, slot);
	};
}
