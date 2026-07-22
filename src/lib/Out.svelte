<!--
	@component
	Renders whatever `<In into={...}>` emplaced into this handle, in the normal
	component tree — so transitions, attachments and `<svelte:boundary>` all
	behave natively.
-->
<script lang="ts">
	import { pick, type Emplacement } from './internal.js';

	let { of: e }: { of: Emplacement } = $props();
</script>

<div data-emplace-out={e.id} style="display: contents">{#each pick(e.reg.inputs, e.mode) as input (input.seq)}{@render input.children?.()}{/each}</div>
