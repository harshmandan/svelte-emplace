<script>
	import { Emplace } from 'svelte-emplace';
	let alt = $state(false);
	globalThis.__swap = () => (alt = true);
</script>

{#snippet a()}<span class="body">content</span>{/snippet}
{#snippet b()}<span class="body">swapped</span>{/snippet}

<Emplace children={alt ? b : a} />
