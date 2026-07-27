<script>
	import { fade } from 'svelte/transition';
	import { In, Out } from 'svelte-emplace';

	let { e } = $props();
	let show = $state(true);
	globalThis.__fade = (v) => (show = v);
</script>

<header><Out of={e} /></header>
<main>
	{#if show}
		<In into={e}><span class="f" transition:fade={{ duration: 100 }}>F</span></In>
	{/if}
</main>
