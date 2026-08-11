import { claim, release, resolveTargets } from './internal.js';

/**
 * Attachment counterpart to `<Emplace>`, for a single element you already have:
 *
 * ```svelte
 * <div class="tip" {@attach emplace('@tips')}>…</div>
 * ```
 *
 * `to` and `priority` mean the same as on the component, and ordering is shared
 * with it. The difference is that the element is created in place and *moved* to
 * its destination — an attachment only receives an element that already exists —
 * so content that a move resets (iframes, video, a focused input) belongs in the
 * component.
 *
 * `{@attach}` needs Svelte 5.29.
 */
export function emplace(to?: string | Element | null, priority = 0) {
	return (node: Element): (() => void) => {
		const target = resolveTargets(to)[0];
		const { slot, anchor } = claim(target, priority);

		// Svelte tears an unmounting block down by walking the contiguous sibling
		// range it recorded at mount. A moved node has left that range, so the walk
		// never reaches it and it survives at its destination — visibly, forever.
		// This comment holds the node's place in the range; cleanup puts the node
		// back into it, and the walk that follows removes both.
		const home = document.createComment('');
		node.before(home);

		target.insertBefore(node, anchor ?? null);

		// Attachment cleanup runs after the outro and before the range walk, so the
		// animation still plays at the destination and the node is home in time to
		// be removed. When `to` changes, this runs first and the re-run above takes
		// the node from `home` to the new destination.
		return () => {
			release(target, slot);
			if (home.isConnected) home.replaceWith(node);
			else node.remove();
		};
	};
}
