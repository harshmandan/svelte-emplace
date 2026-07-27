<!--
	@component
	Emplaces its children into every `<Out of={...}>` for the same handle.
	Renders nothing where it is written.
-->
<script lang="ts">
	import { BROWSER } from 'esm-env';
	import { getAllContexts, onDestroy, type Snippet } from 'svelte';
	import { nextSeq, type Emplacement } from './internal.js';
	import { serverRegister } from './registry.js';

	interface Props {
		/** The handle returned by `emplace()`. */
		into: Emplacement;
		/** Higher wins in `'single'` mode; sorts first in `'multiple'`. Default `0`. */
		priority?: number;
		children?: Snippet;
	}

	let { into: e, priority = 0, children }: Props = $props();
	const seq = nextSeq();

	if (BROWSER) {
		const input = {
			seq,
			get priority() {
				return priority;
			},
			get children() {
				return children;
			}
		};

		// Registered during init, so the outlet has content by the first flush —
		// including the flush that follows hydration.
		// svelte-ignore state_referenced_locally
		e.reg.inputs.push(input);

		onDestroy(() => {
			// Deferred out of the teardown pass deliberately: mutating the registry
			// *during* destroy makes the outlet drop its DOM with no outro and no
			// attachment cleanup. One microtask later it is an ordinary update.
			queueMicrotask(() => {
				e.reg.inputs = e.reg.inputs.filter((r) => r !== input);
			});
		});
	} else {
		// svelte-ignore state_referenced_locally
		serverRegister(e.id, e.mode, { seq, priority, children, context: getAllContexts() });
	}
</script>
