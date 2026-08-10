<script>
	// A labeled destination box for the demos. By default the label overlays
	// the top-right corner so portaled content flows as if the box were empty;
	// `outside` puts it on its own line above for boxes whose content would
	// collide with an overlay.
	let { label, el = $bindable(), cls = '', outside = false, children = undefined } = $props();
</script>

{#if outside}
	<p class="eyebrow text-muted">{label}</p>
{/if}
<div
	bind:this={el}
	class="relative border border-dashed border-rule bg-wash p-3 {outside ? 'mt-2' : ''} {cls}"
>
	{#if !outside}
		<span class="eyebrow pointer-events-none absolute right-2 top-2 text-muted">{label}</span>
	{/if}
	{@render children?.()}
</div>
