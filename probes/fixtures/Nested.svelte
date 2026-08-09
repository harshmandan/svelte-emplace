<script>
	import { fade } from 'svelte/transition';
	import { Emplace } from 'svelte-emplace';
	let open = $state(true);
	let alt = $state(false);
	globalThis.__nested = () => (open = false);
</script>

{#if open}
	<Emplace>
		{#if alt}<span class="n">alt</span>{:else}<span class="n" transition:fade={{ duration: 100 }}>m</span>{/if}
	</Emplace>
{/if}
