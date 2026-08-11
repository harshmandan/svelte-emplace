<script>
	import { Emplace } from '$lib';

	let title = $state('Reports');
</script>

<div>
	<label class="text-sm text-muted" for="multi-title">One source, typed once:</label>
	<input
		id="multi-title"
		class="mt-1 w-full border border-rule bg-paper px-2 py-1 text-sm"
		bind:value={title}
	/>

	<div class="mt-4 space-y-3">
		<div class="border border-rule">
			<div class="flex h-10 items-center justify-between gap-2 border-b border-seam px-3">
				<span data-emplace="demo-title" class="min-w-0 truncate text-sm font-semibold"></span>
				<span class="eyebrow shrink-0 text-muted">desktop header</span>
			</div>
			<div class="h-8 bg-wash"></div>
		</div>
		<div class="w-44 border border-rule">
			<div class="flex h-10 items-center justify-between gap-2 border-b border-seam px-3">
				<span data-emplace="demo-title" class="min-w-0 truncate text-sm font-semibold"></span>
				<span class="eyebrow shrink-0 text-muted">mobile</span>
			</div>
			<div class="h-10 bg-wash"></div>
		</div>
	</div>

	<Emplace to="@demo-title" multiple>{title}</Emplace>

	<p class="mt-3 text-sm leading-relaxed text-muted">
		Two elements share the name <code>demo-title</code>. With <code>multiple</code>, one
		<code>&lt;Emplace&gt;</code> fills both, and both stay live as you type.
	</p>
</div>
