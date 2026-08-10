<script>
	import { Emplace } from '$lib';
	import MovePortal from './MovePortal.svelte';
	import DemoBtn from '../parts/DemoBtn.svelte';

	let layer = $state();
	let btn = $state();
	let show = $state(false);

	// Positions `node` right above `anchor`, in the coordinates of whatever
	// `node` is parented to when this runs — the same thing positioning code
	// like floating-ui does on mount.
	/** @param {HTMLElement} anchor */
	function placeAbove(anchor) {
		return (/** @type {HTMLElement} */ node) => {
			const a = anchor.getBoundingClientRect();
			const p = node.offsetParent?.getBoundingClientRect() ?? { top: 0, left: 0 };
			node.style.left = `${Math.round(a.left - p.left)}px`;
			node.style.top = `${Math.round(a.top - p.top - node.offsetHeight - 8)}px`;
		};
	}
</script>

<div class="relative">
	<!-- The page's tooltip layer: an overlay both portals render into. -->
	<div bind:this={layer} class="pointer-events-none absolute inset-0"></div>

	<p class="text-sm leading-relaxed text-muted">
		Both tips are written inside the component below and rendered into a tooltip layer that
		covers this demo. Same positioning code, same button.
	</p>

	<div class="relative mt-4 border border-dashed border-rule bg-wash p-4">
		<p class="eyebrow text-muted">a component</p>
		<div class="mt-8">
			<DemoBtn bind:el={btn} onclick={() => (show = !show)}>
				{show ? 'hide' : 'show'} both tooltips
			</DemoBtn>
		</div>

		{#if show}
			<MovePortal to={layer}>
				<div
					class="absolute z-10 whitespace-nowrap border border-dashed border-ink bg-paper px-2 py-1 text-xs"
					{@attach placeAbove(btn)}
				>
					move-based · measured before the move
				</div>
			</MovePortal>
			<Emplace to={layer}>
				<div
					class="absolute z-10 whitespace-nowrap border border-ink bg-paper px-2 py-1 text-xs"
					{@attach placeAbove(btn)}
				>
					emplaced · on the button
				</div>
			</Emplace>
		{/if}
	</div>

	<p class="mt-3 text-sm leading-relaxed text-muted">
		The move-based tip measured while it was still inside the component, so it renders adrift by
		exactly the component's offset. The emplaced tip measured in the layer it lives in.
	</p>
</div>
