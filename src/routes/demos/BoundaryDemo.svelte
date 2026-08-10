<script>
	import { Emplace } from '$lib';
	import Crash from './Crash.svelte';
	import Target from '../parts/Target.svelte';
	import DemoBtn from '../parts/DemoBtn.svelte';

	let target = $state();
	let armed = $state(false);
</script>

<div>
	<Target bind:el={target} label="destination" cls="flex min-h-14 flex-wrap items-center gap-2" />

	<!-- Healthy content, outside the boundary: it must survive the crash. -->
	<Emplace to={target}><span class="chip">healthy content</span></Emplace>

	<div class="mt-3">
		<svelte:boundary>
			{#snippet failed(error, reset)}
				<div class="space-y-3">
					<p class="border border-rule bg-wash p-3 text-sm leading-relaxed text-body">
						Caught by the boundary here — the one around the
						<code>&lt;Emplace&gt;</code> that wrote the throwing content. The destination
						above kept its healthy content; nothing went blank.
					</p>
					<DemoBtn
						onclick={() => {
							armed = false;
							reset();
						}}
					>
						reset
					</DemoBtn>
				</div>
			{/snippet}

			{#if armed}
				<Emplace to={target}><Crash /></Emplace>
			{/if}
			<DemoBtn onclick={() => (armed = true)}>emplace content that throws</DemoBtn>
		</svelte:boundary>
	</div>

	<p class="mt-3 text-sm leading-relaxed text-muted">
		The crash happens at the destination but never shows there — it comes back to the boundary
		that wrote the content, and everything else stays up.
	</p>
</div>
