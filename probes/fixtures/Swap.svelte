<script>
	import { In, Out } from 'svelte-emplace';
	let { e } = $props();
	let which = $state('a');
	globalThis.__swap = (v) => (which = v);
</script>

<header><Out of={e} /></header>
{#snippet a()}<span class="sn">SNIP-A</span>{/snippet}
{#snippet b()}<span class="sn">SNIP-B</span>{/snippet}
<main><In into={e} children={which === 'a' ? a : b} /></main>
