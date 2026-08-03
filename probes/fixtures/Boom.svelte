<script>
	let { boom } = $props();
	const val = $derived.by(() => {
		if (boom) throw new Error('boom-from-emplaced');
		return 'ok';
	});
</script>

<span class="ok">{val}</span>
