<script>
	import { Emplace } from '$lib';
	import MovePortal from './MovePortal.svelte';
	import Target from '../parts/Target.svelte';
	import DemoBtn from '../parts/DemoBtn.svelte';

	let moveBar = $state();
	let empBar = $state();
	let open = $state(false);
	let late = $state(false);
	let timer = /** @type {ReturnType<typeof setTimeout> | undefined} */ (undefined);

	function restart() {
		clearTimeout(timer);
		open = false;
		late = false;
		// Remount from scratch on the next frame so the demo can be replayed.
		requestAnimationFrame(() => {
			open = true;
			timer = setTimeout(() => (late = true), 1200);
		});
	}

	$effect(() => () => clearTimeout(timer));
</script>

<div>
	<DemoBtn onclick={restart}>mount Cancel now, Save 1.2s later</DemoBtn>

	<div class="mt-4 space-y-3">
		<Target bind:el={moveBar} label="move-based" outside cls="flex min-h-14 flex-wrap items-center gap-2" />
		<Target bind:el={empBar} label="emplaced · save has priority 10" outside cls="flex min-h-14 flex-wrap items-center gap-2" />
	</div>

	{#if open}
		<MovePortal to={moveBar}><button class="chip">Cancel</button></MovePortal>
		<Emplace to={empBar}><button class="chip">Cancel</button></Emplace>
		{#if late}
			<MovePortal to={moveBar}><button class="chip">Save</button></MovePortal>
			<Emplace to={empBar} priority={10}><button class="chip">Save</button></Emplace>
		{/if}
	{/if}

	<p class="mt-3 text-sm leading-relaxed text-muted">
		Save mounts late in both bars. Only the emplaced bar puts it first, because order follows
		<code>priority</code>, not arrival.
	</p>
</div>
