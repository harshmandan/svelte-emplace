<script>
	import { onMount } from 'svelte';
	import '../app.css';
	import { Emplace } from '$lib';
	import Section from './parts/Section.svelte';
	import Compare from './parts/Compare.svelte';
	import ModalExample from './examples/ModalExample.svelte';
	import ToastExample from './examples/ToastExample.svelte';
	import TooltipDemo from './demos/TooltipDemo.svelte';
	import FocusDemo from './demos/FocusDemo.svelte';
	import InspectDemo from './demos/InspectDemo.svelte';
	import OrderDemo from './demos/OrderDemo.svelte';
	import MultiDemo from './demos/MultiDemo.svelte';
	import BoundaryDemo from './demos/BoundaryDemo.svelte';

	// Add a copy button to every static snippet.
	onMount(() => {
		for (const pre of document.querySelectorAll('pre:not([data-nocopy])')) {
			const wrap = document.createElement('div');
			wrap.className = 'copy-wrap';
			pre.replaceWith(wrap);
			wrap.append(pre);

			const button = document.createElement('button');
			button.type = 'button';
			button.className = 'copy-btn';
			button.textContent = '[copy]';
			button.setAttribute('aria-label', 'Copy this snippet');
			if (!pre.textContent.trim().includes('\n')) button.classList.add('copy-mid');

			button.addEventListener('click', async () => {
				const text = pre.textContent.trim();

				try {
					await navigator.clipboard.writeText(text);
				} catch {
					const field = document.createElement('textarea');
					field.value = text;
					document.body.append(field);
					field.select();
					document.execCommand('copy');
					field.remove();
				}

				button.textContent = '[copied]';
				setTimeout(() => (button.textContent = '[copy]'), 1200);
			});

			wrap.append(button);
		}
	});
</script>

<svelte:head>
	<title>svelte-emplace — a portal component for Svelte 5</title>
	<meta
		name="description"
		content="A 180-line portal component for Svelte 5. Mounts modals, tooltips and toasts directly into their target element — no wrapper divs, no re-parenting, working transitions."
	/>
</svelte:head>

<a
	href="#start"
	class="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:border focus:border-ink focus:bg-paper focus:px-3 focus:py-2 focus:text-sm"
	>Skip to get started</a
>

<header class="border-b border-seam">
	<div class="mx-auto max-w-5xl px-5 py-4 sm:px-8">
		<div class="flex flex-wrap items-baseline justify-between gap-3">
			<h1 class="text-base font-medium tracking-tight">svelte-emplace</h1>
			<nav class="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted">
				<a class="hover:text-ink" href="#start">Get started</a>
				<a class="hover:text-ink" href="#examples">Examples</a>
				<a class="hover:text-ink" href="#why">Why</a>
				<a class="hover:text-ink" href="#api">API</a>
				<a class="hover:text-ink" href="#limits">Notes</a>
				<a class="hover:text-ink" href="https://github.com/harshmandan/svelte-emplace">GitHub</a>
			</nav>
		</div>
	</div>
</header>

<section class="border-b border-seam">
	<div class="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
		<p class="eyebrow text-muted">Svelte 5 · 180 lines · no dependencies</p>
		<svg
			viewBox="0 0 64 64"
			width="68"
			height="68"
			fill="none"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-linejoin="bevel"
			aria-hidden="true"
			class="mt-7 block"
		>
			<polygon points="6,44 32,35 58,44 32,53" fill="var(--paper)" />
			<polygon points="6,32 32,23 58,32 32,41" fill="var(--paper)" stroke-dasharray="4 3" />
			<polygon points="6,20 32,11 58,20 32,29" fill="currentColor" />
		</svg>
		<h2 class="mt-6 max-w-2xl text-3xl font-semibold leading-snug tracking-tight sm:text-4xl">
			A portal component.
		</h2>
		<p class="mt-5 max-w-xl text-base leading-relaxed text-body">
			<code>&lt;Emplace&gt;</code> mounts a modal, tooltip or toast directly into its target
			element, instead of rendering it in place and moving the DOM node. Positioning, focus and
			transitions are correct from the first frame.
		</p>

		<div class="mt-9 border border-rule">
			<div class="grid grid-cols-1 sm:grid-cols-2">
				<div class="min-w-0 p-4 sm:p-5">
					<p class="eyebrow text-muted">Other portals: render, then move</p>
					<pre data-nocopy class="mt-3 overflow-x-auto text-xs leading-relaxed sm:text-sm">
&lt;main&gt;
  &lt;div class="tip"&gt;         --+   rendered here
                              |
&lt;body&gt;                        |
  &lt;div id="layer"&gt;            |
    &lt;div class="tip"&gt;       &lt;-+   moved here after</pre>
				</div>
				<div class="min-w-0 border-t border-rule p-4 sm:border-l sm:border-t-0 sm:p-5">
					<p class="eyebrow text-muted">Emplace: mount at the target</p>
					<pre data-nocopy class="mt-3 overflow-x-auto text-xs leading-relaxed sm:text-sm">
&lt;main&gt;
  (nothing)

&lt;body&gt;
  &lt;div id="layer"&gt;
    &lt;div class="tip"&gt;             mounted here</pre>
				</div>
			</div>
		</div>
	</div>
</section>

<Section id="start" label="Get started">
	<div class="mt-6 grid grid-cols-1 gap-px border border-rule bg-rule md:grid-cols-3">
		<div class="min-w-0 bg-paper p-4 sm:p-5">
			<p class="text-base font-semibold">1 · Install</p>
			<pre class="mt-3 overflow-x-auto bg-wash p-3 text-sm">npm i svelte-emplace</pre>
			<p class="mt-3 text-sm leading-relaxed text-body">Needs Svelte 5.</p>
		</div>
		<div class="min-w-0 bg-paper p-4 sm:p-5">
			<p class="text-base font-semibold">2 · Use it</p>
			<pre class="mt-3 overflow-x-auto bg-wash p-3 text-sm">
&lt;script&gt;
  import &#123; Emplace &#125;
    from 'svelte-emplace';
&lt;/script&gt;

&lt;Emplace&gt;
  &lt;div class="modal"&gt;…&lt;/div&gt;
&lt;/Emplace&gt;</pre>
			<p class="mt-3 text-sm leading-relaxed text-body">
				No props needed. Content renders into a shared container at the end of
				<code>&lt;body&gt;</code>.
			</p>
		</div>
		<div class="min-w-0 bg-paper p-4 sm:p-5">
			<p class="text-base font-semibold">
				3 · Pick a spot <span class="font-normal text-muted">— optional</span>
			</p>
			<pre class="mt-3 overflow-x-auto bg-wash p-3 text-sm">
&lt;h1 data-emplace="title"&gt;&lt;/h1&gt;

&lt;Emplace to="@title"&gt;
  &#123;data.title&#125;
&lt;/Emplace&gt;</pre>
			<p class="mt-3 text-sm leading-relaxed text-body">
				Use <code>to</code> to render into a specific element. Modals and toasts usually don't
				need it.
			</p>
		</div>
	</div>
</Section>

<Section id="examples" label="Examples">
	<div class="mt-6 grid grid-cols-1 gap-px border border-rule bg-rule md:grid-cols-3">
		<div class="min-w-0 bg-paper p-4 sm:p-5">
			<p class="text-base font-semibold">Modal</p>
			<pre data-nocopy class="mt-3 overflow-x-auto bg-wash p-3 text-sm">
&lt;Emplace&gt;
  &#123;#if open&#125;
    &lt;div class="modal" transition:fade&gt;
      …
    &lt;/div&gt;
  &#123;/if&#125;
&lt;/Emplace&gt;</pre>
			<p class="mt-3 text-sm leading-relaxed text-body">
				No <code>to</code> needed — it renders at the end of <code>&lt;body&gt;</code>.
			</p>
			<div class="mt-3"><ModalExample /></div>
		</div>
		<div class="min-w-0 bg-paper p-4 sm:p-5">
			<p class="text-base font-semibold">Toasts</p>
			<pre data-nocopy class="mt-3 overflow-x-auto bg-wash p-3 text-sm">
&lt;Emplace&gt;
  &lt;div class="stack"&gt;
    &#123;#each toasts as t (t.id)&#125;
      &lt;p transition:fly=&#123;&#123; y: 8 &#125;&#125;&gt;
        &#123;t.text&#125;
      &lt;/p&gt;
    &#123;/each&#125;
  &lt;/div&gt;
&lt;/Emplace&gt;</pre>
			<p class="mt-3 text-sm leading-relaxed text-body">
				One stack, filled from anywhere. Outros play at the target.
			</p>
			<div class="mt-3"><ToastExample /></div>
		</div>
		<div class="min-w-0 bg-paper p-4 sm:p-5">
			<p class="text-base font-semibold">Layout slot</p>
			<pre data-nocopy class="mt-3 overflow-x-auto bg-wash p-3 text-sm">
&lt;!-- layout --&gt;
&lt;h1 data-emplace="title"&gt;&lt;/h1&gt;

&lt;!-- any page --&gt;
&lt;Emplace to="@title"&gt;
  &#123;post.title&#125;
&lt;/Emplace&gt;</pre>
			<p class="mt-3 text-sm leading-relaxed text-body">
				Pages fill layout slots directly — no prop drilling. Try it live in
				<a class="underline hover:text-ink" href="#why">the demos below</a>.
			</p>
		</div>
	</div>

	<div class="mt-px border border-rule bg-paper p-4 sm:p-5">
		<p class="text-base font-semibold">
			Server rendering <span class="font-normal text-muted">— optional</span>
		</p>
		<pre data-nocopy class="mt-3 overflow-x-auto bg-wash p-3 text-sm">
// src/hooks.server.js
export &#123; emplaceHandle as handle &#125; from 'svelte-emplace/server'</pre>
		<p class="mt-3 max-w-2xl text-sm leading-relaxed text-body">
			That is the whole setup. Content aimed at an <em>@name</em> now arrives in the first response
			instead of appearing after hydration. Selectors, elements and the default layer need a DOM, so
			they stay client-only — which is what a modal wants anyway.
		</p>

		<div class="mt-4 max-w-2xl border border-rule bg-wash p-3">
			<p class="eyebrow text-muted">Demo — server-rendered</p>
			<p data-emplace="ssr-note" class="mt-2 text-sm font-semibold"></p>
			<p class="mt-2 text-xs leading-relaxed text-muted">
				That text is written near the bottom of this page and aimed at the empty spot above. The
				server put it there. View source — it is already in the HTML.
			</p>
		</div>
	</div>
</Section>

<Emplace to="@ssr-note">This text was placed by the server, not the browser</Emplace>

<Section id="why" label="Why">
	<p class="mt-4 max-w-xl text-sm leading-relaxed text-muted">
		<code>svelte-portal</code> renders content in place and moves the DOM node to its target.
		<code>svelte-emplace</code> mounts it at the target directly. Six practical differences
		follow — every demo below runs both, live.
	</p>

	<div class="mt-7 grid grid-cols-1 gap-px border border-rule bg-rule">
		<Compare title="Positioning is correct on the first frame">
			{#snippet prose()}Attachments and actions run when the element mounts. If the element
				mounts inside your component and is moved to the target afterwards, the positioning
				code has already measured the wrong parent — and it does not run again.{/snippet}
			{#snippet portal()}Measures where it was rendered, then gets moved. The element sits in
				the wrong position until you re-measure by hand.{/snippet}
			{#snippet emplace()}Mounts at the target, so the first measurement is the final one.{/snippet}
			{#snippet demo()}<TooltipDemo />{/snippet}
		</Compare>

		<Compare title="Nothing resets">
			{#snippet prose()}Moving a DOM node means detaching it and re-inserting it elsewhere. The
				browser treats the re-inserted node as new, and everything live inside it starts
				over.{/snippet}
			{#snippet portal()}Videos restart, a checkout iframe reloads, and a focused input loses
				its cursor.{/snippet}
			{#snippet emplace()}The node is never re-parented, so nothing inside it resets.{/snippet}
			{#snippet demo()}<FocusDemo />{/snippet}
		</Compare>

		<Compare title="No wrapper element">
			{#snippet prose()}Moving a node requires a handle on it, so portals wrap your content in
				an extra element. The wrapper stays in the DOM, between the target and your
				markup.{/snippet}
			{#snippet portal()}Wraps your content in a <code>&lt;div&gt;</code>, which breaks flex and
				grid spacing and any CSS that expects a direct child.{/snippet}
			{#snippet emplace()}No wrapper. Your markup is a direct child of the target; ordering is
				tracked with comment nodes.{/snippet}
			{#snippet demo()}<InspectDemo />{/snippet}
		</Compare>

		<Compare title="Explicit ordering">
			{#snippet prose()}Several parts of an app often fill the same target — toolbar buttons, a
				toast stack. Without an explicit order, the result depends on which component happened
				to mount first.{/snippet}
			{#snippet portal()}Order follows mount order and cannot be set.{/snippet}
			{#snippet emplace()}<code>priority</code> sets the order, and it holds even when
				components mount late or unmount.{/snippet}
			{#snippet demo()}<OrderDemo />{/snippet}
		</Compare>

		<Compare title="One source, several targets">
			{#snippet prose()}A DOM node has exactly one parent, so a moved node can only ever be in
				one place. Mounted content can be created once per matching target.{/snippet}
			{#snippet portal()}One place only. Filling a mobile and a desktop header means writing the
				content twice.{/snippet}
			{#snippet emplace()}Every element with the target name gets its own copy, and all of them
				stay live.{/snippet}
			{#snippet demo()}<MultiDemo />{/snippet}
		</Compare>

		<Compare title="Errors reach your boundary">
			{#snippet prose()}Content rendered elsewhere in the DOM still belongs to the component
				that created it. If it throws, the error propagates to the
				<code>&lt;svelte:boundary&gt;</code> around the <code>&lt;Emplace&gt;</code>, so your
				fallback renders instead of a blank screen.{/snippet}
			{#snippet portal()}Also handled — the content stays in the component tree even though the
				node moves.{/snippet}
			{#snippet emplace()}Caught at the target and re-thrown at the source, so the rest of the
				page keeps working.{/snippet}
			{#snippet demo()}<BoundaryDemo />{/snippet}
		</Compare>
	</div>
</Section>

<Section id="api" label="The whole API">
	<div class="mt-6 grid grid-cols-1 gap-px border border-rule bg-rule md:grid-cols-2">
		<div class="min-w-0 bg-paper p-4 sm:p-6">
			<pre data-nocopy class="overflow-x-auto bg-wash p-3 text-sm leading-relaxed">
&lt;Emplace&gt;…&lt;/Emplace&gt;

&lt;Emplace to="@title"&gt;…&lt;/Emplace&gt;

&lt;Emplace to="#tooltips"&gt;…&lt;/Emplace&gt;

&lt;Emplace to=&#123;element&#125;&gt;…&lt;/Emplace&gt;

&lt;Emplace to="@toolbar" priority=&#123;10&#125;&gt;
  …
&lt;/Emplace&gt;

&lt;div &#123;@attach emplace('@tips')&#125;&gt;
  …
&lt;/div&gt;</pre>
		</div>
		<dl class="min-w-0 bg-paper p-4 text-sm sm:p-6">
			<dt class="text-base font-semibold">No <code>to</code></dt>
			<dd class="mt-1 text-body">
				Renders into a shared container at the end of <code>&lt;body&gt;</code>.
			</dd>
			<dt class="mt-4 text-base font-semibold">Starts with <code>@</code></dt>
			<dd class="mt-1 text-body">
				Renders into any element marked <code>data-emplace="name"</code>. If several match,
				each gets a copy.
			</dd>
			<dt class="mt-4 text-base font-semibold">Any other string</dt>
			<dd class="mt-1 text-body">
				Passed to <code>querySelector</code> — tag, id, class and attribute selectors all work.
			</dd>
			<dt class="mt-4 text-base font-semibold">An element</dt>
			<dd class="mt-1 text-body">Renders into that element.</dd>
			<dt class="mt-4 text-base font-semibold"><code>priority</code></dt>
			<dd class="mt-1 text-body">Higher values render first.</dd>
			<dt class="mt-4 text-base font-semibold"><code>emplace(to, priority)</code></dt>
			<dd class="mt-1 text-body">
				The same targeting as an attachment, for an element you already have. It moves the
				element, so use the component when anything inside must not reset. Needs Svelte 5.29.
			</dd>
		</dl>
	</div>
</Section>

<Section id="limits" label="Notes">
	<div class="mt-6 grid grid-cols-1 gap-px border border-rule bg-rule md:grid-cols-2">
		<div class="min-w-0 bg-paper p-4 sm:p-5">
			<p class="text-base font-semibold">Server rendering is opt-in</p>
			<p class="mt-2 text-sm leading-relaxed text-body">
				Without the hook, content mounts in the browser only. With it, <code>@name</code> targets
				are in the first response but the destination element has to be empty, and the page is no
				longer streamed.
			</p>
		</div>
		<div class="min-w-0 bg-paper p-4 sm:p-5">
			<p class="text-base font-semibold">The target resolves once</p>
			<p class="mt-2 text-sm leading-relaxed text-body">
				The target is looked up when the content mounts. If it is not in the DOM yet, the
				content falls back to the <code>&lt;body&gt;</code> container and stays there.
			</p>
		</div>
		<div class="min-w-0 bg-paper p-4 sm:p-5">
			<p class="text-base font-semibold">The attachment moves the element</p>
			<p class="mt-2 text-sm leading-relaxed text-body">
				An attachment receives an element that already exists, so
				<code>&#123;@attach emplace('@tips')&#125;</code> re-parents it — the trade-off the
				component avoids. Handy for one element; a node can only be in one place, so the first
				matching target wins.
			</p>
		</div>
	</div>
</Section>

<footer>
	<div
		class="mx-auto flex max-w-5xl flex-wrap items-baseline justify-between gap-3 px-5 py-8 text-sm text-muted sm:px-8"
	>
		<p>MIT · Svelte 5</p>
		<nav class="flex flex-wrap gap-x-5 gap-y-1">
			<a class="hover:text-ink" href="https://github.com/harshmandan/svelte-emplace">GitHub</a>
			<a class="hover:text-ink" href="https://www.npmjs.com/package/svelte-emplace">npm</a>
			<a class="hover:text-ink" href="https://github.com/harshmandan/svelte-emplace#readme"
				>Docs</a
			>
		</nav>
	</div>
</footer>
