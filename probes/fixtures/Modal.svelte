<script>
	import { fade } from 'svelte/transition';
	import { Emplace } from 'svelte-emplace';

	let { to = undefined, multiple = false, boomFromStart = false } = $props();
	let open = $state(true);
	let boom = $state(boomFromStart);

	globalThis.__m = {
		close: () => (open = false),
		openIt: () => (open = true),
		boom: () => (boom = true),
		attached: [],
		detached: 0,
		caught: []
	};

	function explode() {
		throw new Error('boom-from-emplaced');
	}
</script>

<main>
	<svelte:boundary onerror={(e) => globalThis.__m.caught.push('source:' + e.message)}>
		{#snippet failed()}<span class="src-failed">fallback</span>{/snippet}
		{#if open}<Emplace {to} {multiple}><span
					class="body"
					transition:fade={{ duration: 100 }}
					{@attach (node) => {
						globalThis.__m.attached.push({
							parent: node.parentElement?.getAttribute('data-emplace') || node.parentElement?.id || 'layer',
							connected: node.isConnected
						});
						return () => globalThis.__m.detached++;
					}}>{boom ? explode() : 'content'}</span
				></Emplace>{/if}
	</svelte:boundary>
</main>
