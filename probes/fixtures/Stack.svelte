<script>
	import { Emplace } from 'svelte-emplace';

	// Mounted in ascending priority on purpose: DOM order must still come out
	// descending, proving order follows priority and not mount order.
	let { to = undefined } = $props();
	let extra = $state(false);
	globalThis.__stack = () => (extra = true);
</script>

<Emplace {to} priority={1}><span class="s">low</span></Emplace>
<Emplace {to} priority={5}><span class="s">high</span></Emplace>
<Emplace {to} priority={3}><span class="s">mid</span></Emplace>
{#if extra}<Emplace {to} priority={4}><span class="s">late</span></Emplace>{/if}
