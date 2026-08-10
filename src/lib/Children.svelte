<!--
	@component
	@internal Renders one collected snippet on its own, so the server can render it
	after the page render is finished.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	let { children }: { children?: Snippet } = $props();
</script>

{@render children?.()}
