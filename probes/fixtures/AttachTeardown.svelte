<script>
	import { fade } from 'svelte/transition';
	import { emplace } from 'svelte-emplace';
	import AttachLeaf from './AttachLeaf.svelte';

	let { to = undefined, shape = 'inline' } = $props();
	let open = $state(true);

	globalThis.__t = { close: () => (open = false) };
</script>

<main>
	{#if shape === 'out'}
		{#if open}
			<span class="moved" out:fade={{ duration: 100 }} {@attach emplace(to)}>moved</span>
		{/if}
	{:else if shape === 'alone'}
		{#if open}
			<span class="moved" {@attach emplace(to)}>moved</span>
		{/if}
	{:else if open}
		{#if shape === 'component'}
			<AttachLeaf {to} />
		{:else if shape === 'pair'}
			<span class="moved" {@attach emplace(to)}>one</span>
			<span class="moved" {@attach emplace(to)}>two</span>
			<span class="stay">stayed</span>
		{:else}
			<span class="moved" {@attach emplace(to)}>moved</span>
			<span class="stay">stayed</span>
		{/if}
	{/if}
</main>
