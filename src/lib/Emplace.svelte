<!--
	@component
	Renders its children somewhere else in the document, without relocating any
	DOM. The content is created at its destination, so measurements, focus and
	attachments are correct on the first frame.

	```svelte
	<Emplace>
		<div class="modal" transition:fade>…</div>
	</Emplace>
	```

	`to` picks the destination: omit it for a shared layer at the end of
	`<body>`, or pass a name for `[data-emplace="name"]`, a CSS selector, or an
	element. Anything unresolvable falls back to the body layer rather than
	throwing.
-->
<script lang="ts">
	import { mount, unmount, type Snippet } from 'svelte';
	import Boundary from './Boundary.svelte';
	import { claim, release, resolveTargets } from './internal.js';

	interface Props {
		/** A name, a CSS selector, or an element. Omit for the body layer. */
		to?: string | Element | null;
		/** Higher sorts first at the destination. Ties keep registration order. */
		priority?: number;
		children?: Snippet;
	}

	let { to, priority = 0, children }: Props = $props();

	let caught: unknown = $state(null);

	// The snippet travels in a box, for two reasons. Props handed to `mount()` are
	// not live, so this is what keeps a swapped snippet in sync. And keeping
	// `children` out of the mounting effect below stops a swap from tearing the
	// destination down and rebuilding it.
	//
	// The empty guard is load-bearing: while the source is being torn down this
	// runs once more with `children` undefined, and writing that through would
	// blank the destination before any outro could play.
	const box = $state({ children });
	$effect(() => {
		if (children) box.children = children;
	});

	// Mounting inside an effect — and unmounting in *its* cleanup — is what makes
	// closing animations work. Doing the same work in `onDestroy` runs too late: the
	// outro is suppressed and the content vanishes instantly.
	//
	// No browser guard is needed here: Svelte's server compiler strips effect
	// bodies, so none of this is emitted for the server in the first place.
	$effect(() => {
		const mounted = resolveTargets(to).map((target) => {
			const { slot, anchor } = claim(target, priority);

			const instance = mount(Boundary, {
				target,
				anchor,
				intro: true,
				props: {
					box,
					// Deferred: the error can arrive while a render pass is still in
					// flight, and state cannot be written during one.
					onerror: (error: unknown) => queueMicrotask(() => (caught = error))
				}
			});

			return { target, slot, instance };
		});

		return () => {
			for (const { target, slot, instance } of mounted) {
				// Hold the reserved position until the outro has finished.
				Promise.resolve(unmount(instance, { outro: true })).then(() => release(target, slot));
			}
		};
	});

	// Rethrowing in an effect hands the error to the nearest `<svelte:boundary>`
	// above this component — the tree that wrote the content, not the destination.
	$effect(() => {
		if (caught) throw caught;
	});
</script>
