<script>
	import { Emplace } from '$lib';
	import MovePortal from './MovePortal.svelte';
	import DemoBtn from '../parts/DemoBtn.svelte';

	let open = $state(false);
	let moveNav = $state();
	let empNav = $state();
	let moveHtml = $state('');
	let empHtml = $state('');

	// Svelte's anchor comments are stripped so the serialization shows the one
	// structural difference: a wrapper element versus none.
	/** @param {Element} target */
	function serialize(target) {
		return target.innerHTML.replaceAll('<!---->', '').trim() || '(empty)';
	}

	$effect(() => {
		open;
		const t = setTimeout(() => {
			moveHtml = serialize(moveNav);
			empHtml = serialize(empNav);
		}, 100);
		return () => clearTimeout(t);
	});
</script>

<div>
	<DemoBtn onclick={() => (open = !open)}>{open ? 'unmount' : 'mount'} a button into both</DemoBtn>

	<div class="mt-4 space-y-4">
		<div>
			<p class="eyebrow text-muted">move-based — what ends up in the page</p>
			<nav
				bind:this={moveNav}
				class="mt-2 flex min-h-12 flex-wrap items-center gap-2 border border-dashed border-rule p-2"
			></nav>
			<pre data-nocopy class="mt-2 overflow-x-auto bg-wash p-2 text-xs">{moveHtml}</pre>
		</div>
		<div>
			<p class="eyebrow text-muted">emplaced — what ends up in the page</p>
			<nav
				bind:this={empNav}
				class="mt-2 flex min-h-12 flex-wrap items-center gap-2 border border-dashed border-rule p-2"
			></nav>
			<pre data-nocopy class="mt-2 overflow-x-auto bg-wash p-2 text-xs">{empHtml}</pre>
		</div>
	</div>

	{#if open}
		<MovePortal to={moveNav}><button class="chip">Save</button></MovePortal>
		<Emplace to={empNav}><button class="chip">Save</button></Emplace>
	{/if}

	<p class="mt-3 text-sm leading-relaxed text-muted">
		The move-based button arrives inside a wrapper <code>&lt;div&gt;</code>; the emplaced one is
		a direct child, held in order by comment markers.
	</p>
</div>
