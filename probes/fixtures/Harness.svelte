<script>
	import { In, Out } from 'svelte-emplace';

	let { e, twoOuts = false } = $props();

	let showA = $state(true);
	let showB = $state(false);
	let n = $state(0);

	globalThis.__probe = {
		setA: (v) => (showA = v),
		setB: (v) => (showB = v),
		bump: () => n++,
		attached: [],
		detached: 0
	};
</script>

<header>
	<Out of={e} />
	{#if twoOuts}<aside><Out of={e} /></aside>{/if}
</header>

<main>
	{#if showA}
		<In into={e}>
			<span
				class="a"
				{@attach (node) => {
					globalThis.__probe.attached.push(node);
					return () => globalThis.__probe.detached++;
				}}>A n={n}</span
			>
		</In>
	{/if}
	{#if showB}<In into={e}><span class="b">B</span></In>{/if}
</main>
