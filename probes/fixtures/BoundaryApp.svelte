<script>
	import Boom from './Boom.svelte';
	import { In, Out } from 'svelte-emplace';

	let { e } = $props();
	let boom = $state(false);
	globalThis.__caught = [];
	globalThis.__setBoom = () => (boom = true);
</script>

<header>
	<svelte:boundary onerror={(err) => globalThis.__caught.push('destination:' + err.message)}>
		{#snippet failed()}<span class="failed-dest">dest</span>{/snippet}
		<Out of={e} />
	</svelte:boundary>
</header>

<main>
	<svelte:boundary onerror={(err) => globalThis.__caught.push('source:' + err.message)}>
		{#snippet failed()}<span class="failed-src">src</span>{/snippet}
		<In into={e}><Boom {boom} /></In>
	</svelte:boundary>
</main>
