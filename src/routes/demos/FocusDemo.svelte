<script>
	import { Emplace } from '$lib';
	import MovePortal from './MovePortal.svelte';
	import Target from '../parts/Target.svelte';
	import DemoBtn from '../parts/DemoBtn.svelte';

	let moveBox = $state();
	let empBox = $state();
	let open = $state(false);
	let moveFocused = $state(/** @type {boolean | null} */ (null));
	let empFocused = $state(/** @type {boolean | null} */ (null));

	// Focus the field on mount, then check where focus actually ended up.
	/** @param {(focused: boolean) => void} report */
	function probe(report) {
		return (/** @type {HTMLElement} */ node) => {
			node.focus({ preventScroll: true });
			const t = setTimeout(() => report(document.activeElement === node), 150);
			return () => clearTimeout(t);
		};
	}

	function toggle() {
		open = !open;
		moveFocused = empFocused = null;
	}
</script>

<div>
	<DemoBtn onclick={toggle}>{open ? 'close both fields' : 'open both fields, autofocused'}</DemoBtn>

	<div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
		<div class="min-w-0">
			<Target bind:el={moveBox} label="move-based" cls="min-h-20" />
			<p class="mt-2 text-sm text-muted">
				{moveFocused == null ? '—' : moveFocused ? '✓ focused' : '✗ focus lost in the move'}
			</p>
		</div>
		<div class="min-w-0">
			<Target bind:el={empBox} label="emplaced" cls="min-h-20" />
			<p class="mt-2 text-sm text-muted">
				{empFocused == null ? '—' : empFocused ? '✓ still focused' : '✗ focus lost'}
			</p>
		</div>
	</div>

	{#if open}
		<MovePortal to={moveBox}>
			<input
				class="mt-6 w-full border border-rule bg-paper px-2 py-1 text-sm"
				placeholder="autofocused"
				{@attach probe((v) => (moveFocused = v))}
			/>
		</MovePortal>
		<Emplace to={empBox}>
			<input
				class="mt-6 w-full border border-rule bg-paper px-2 py-1 text-sm"
				placeholder="autofocused"
				{@attach probe((v) => (empFocused = v))}
			/>
		</Emplace>
	{/if}
</div>
