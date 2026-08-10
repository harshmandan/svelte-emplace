<script>
	let { id, label, children } = $props();
</script>

<section {id} class="border-b border-seam">
	<div class="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-12">
		<p class="eyebrow text-muted">{label}</p>
		{@render children()}
	</div>
</section>
