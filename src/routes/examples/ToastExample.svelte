<script>
	import { fly } from 'svelte/transition';
	import { Emplace } from '$lib';
	import DemoBtn from '../parts/DemoBtn.svelte';

	let toasts = $state(/** @type {{ id: number; text: string }[]} */ ([]));
	let n = 0;

	function push() {
		const id = ++n;
		toasts.push({ id, text: `Saved change #${id}` });
		setTimeout(() => {
			toasts.splice(
				toasts.findIndex((t) => t.id === id),
				1
			);
		}, 2500);
	}
</script>

<DemoBtn onclick={push}>push a toast</DemoBtn>

<Emplace>
	<div class="pointer-events-none fixed bottom-4 right-4 z-40 flex flex-col gap-2">
		{#each toasts as toast (toast.id)}
			<p
				transition:fly={{ y: 8 }}
				class="border border-rule bg-paper px-3 py-2 text-sm text-body"
			>
				{toast.text}
			</p>
		{/each}
	</div>
</Emplace>
