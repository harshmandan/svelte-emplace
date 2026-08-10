<script>
	import { fade } from 'svelte/transition';
	import { Emplace } from '$lib';
	import DemoBtn from '../parts/DemoBtn.svelte';

	let open = $state(false);
</script>

<DemoBtn onclick={() => (open = true)}>open it</DemoBtn>

<svelte:window onkeydown={(e) => e.key === 'Escape' && (open = false)} />

<Emplace>
	{#if open}
		<div
			role="presentation"
			class="fixed inset-0 z-40 grid place-items-center bg-black/40 p-4"
			transition:fade={{ duration: 150 }}
			onclick={(e) => e.target === e.currentTarget && (open = false)}
		>
			<div class="w-full max-w-sm border border-rule bg-paper p-5">
				<p class="text-base font-semibold">A modal</p>
				<p class="mt-2 text-sm leading-relaxed text-body">
					Mounted at the end of <code>&lt;body&gt;</code>. The fade plays on close too.
				</p>
				<div class="mt-4"><DemoBtn onclick={() => (open = false)}>close</DemoBtn></div>
			</div>
		</div>
	{/if}
</Emplace>
