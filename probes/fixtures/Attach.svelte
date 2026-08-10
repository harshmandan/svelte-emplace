<script>
	import { fade } from 'svelte/transition';
	import { emplace } from 'svelte-emplace';

	let { to = undefined } = $props();
	let retargeted = $state(undefined);
	let open = $state(true);

	globalThis.__a = {
		close: () => (open = false),
		openIt: () => (open = true),
		retarget: (t) => (retargeted = t),
		parents: []
	};
</script>

<main>
	{#if open}
		<span
			class="att"
			transition:fade={{ duration: 100 }}
			{@attach emplace(retargeted ?? to)}
			{@attach (node) => {
				globalThis.__a.parents.push(
					node.parentElement?.getAttribute('data-emplace') ||
						(node.parentElement?.hasAttribute('data-emplace-layer') ? 'layer' : 'main')
				);
			}}>attached</span
		>
	{/if}
</main>
