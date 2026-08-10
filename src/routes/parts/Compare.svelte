<script>
	let { title, prose, portal, emplace, demo } = $props();
</script>

<article class="min-w-0 bg-paper p-5 sm:p-7">
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-10">
		<div class="min-w-0">
			<h3 class="text-lg font-semibold">{title}</h3>
			<p class="mt-3 text-sm leading-relaxed text-body">{@render prose()}</p>
			<dl class="mt-5 space-y-3 text-sm leading-relaxed">
				<div>
					<dt class="text-muted">svelte-portal</dt>
					<dd class="mt-1 text-body">{@render portal()}</dd>
				</div>
				<div>
					<dt class="text-muted">svelte-emplace</dt>
					<dd class="mt-1 font-bold text-ink">{@render emplace()}</dd>
				</div>
			</dl>
		</div>
		<div class="min-w-0">{@render demo()}</div>
	</div>
</article>
