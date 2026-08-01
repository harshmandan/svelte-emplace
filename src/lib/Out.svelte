<!--
	@component
	Renders whatever `<In into={...}>` emplaced into this handle, in the normal
	component tree — so transitions, attachments and `<svelte:boundary>` all
	behave natively.

	```svelte
	<header><Out of={pageTitle} /></header>
	```
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { pick, type Emplacement } from './internal.js';

	let { of: e }: { of: Emplacement } = $props();
	let ssr: HTMLDivElement | undefined;

	// The server-rendered copy lives in its own element, kept empty in the client
	// template. That is the one shape Svelte hydrates leniently: it claims the
	// element without validating its children. Put the copy in the same element
	// as the block below and hydration mismatches instead. It is handed over on
	// mount, in the same flush the live block first renders, so there is no flash.
	onMount(() => ssr?.remove());
</script>

<div data-emplace-out={e.id} style="display: contents"><div data-emplace-ssr style="display: contents" bind:this={ssr}></div>{#each pick(e.reg.inputs, e.mode) as input (input.seq)}{@render input.children?.()}{/each}</div>
