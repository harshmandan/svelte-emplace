<!--
	@component
	@internal Wraps emplaced content at its destination. An `onerror`-only
	boundary catches and renders nothing, which lets `<Emplace>` hand the error
	back to the tree that authored the content instead of showing a fallback in
	someone else's part of the page.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		box,
		onerror
	}: { box: { children?: Snippet }; onerror: (error: unknown) => void } = $props();
</script>

<svelte:boundary {onerror}>{@render box.children?.()}</svelte:boundary>
