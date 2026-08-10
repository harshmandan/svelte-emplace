<script>
	let { onclick, el = $bindable(), children } = $props();
</script>

<button
	bind:this={el}
	{onclick}
	class="border border-rule bg-paper px-3 py-1.5 text-sm text-body hover:border-ink hover:text-ink"
>
	{@render children()}
</button>
