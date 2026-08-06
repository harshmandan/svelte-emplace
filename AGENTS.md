# AGENTS.md

Read this before changing anything in `src/lib`.

## What this package is

`<Out>` renders emplaced snippets **itself**, with `{@render}`, inside the normal
component tree. It does not `mount()` a detached root. That single decision is
what makes transitions, attachments and `<svelte:boundary>` native instead of
emulated, and it is the reason this package exists rather than being another
portal. Do not reintroduce `mount()`.

On the server, `<In>` registers into an `AsyncLocalStorage` store and the hook
renders each snippet *after* the page render, splicing the result into the
outlet's anchor. That is what puts server HTML in the correct DOM position
without moving nodes.

## Four constraints found by probing, not reasoning

Every one of these is load-bearing and every one silently breaks something if
reverted. `probes/` covers all four; run `npm test` before and after any change.

1. **Unregistration must be deferred one microtask.** Mutating the registry
   inside `onDestroy` happens during Svelte's teardown pass, and the outlet then
   drops the DOM with **no outro and no attachment cleanup**. See `In.svelte`.

2. **Unregister by `seq`, never by identity.** Pushing a record into a `$state`
   array proxies it, so `inputs[i] !== record` and an identity filter removes
   nothing. It also logs `state_proxy_equality_mismatch`.

3. **The server copy needs its own static, client-childless element.** Svelte
   hydrates extra server children leniently *only* in a fully static element. Put
   the server copy in the same element as the each-block and you get
   `hydration_mismatch`. See the inner `data-emplace-ssr` div in `Out.svelte`.

4. **`render()` from `svelte/server` is lazy.** It returns
   `{ get head(), get body() }` and component bodies do not execute until a
   property is read. Collect *after* reading `.body`, or the store is empty. This
   is why the hook works inside `transformPageChunk`.

## Registration timing

`<In>` registers during **init**, not in an effect, so the outlet has content by
the first flush — including the flush right after hydration. That is what makes
the handover single-paint: the live block renders and `onMount` removes the
server copy in the same flush. Moving registration into an `$effect` reintroduces
a flash.

## Ordering

Precedence is `priority`, then `seq` (monotonic, app-wide). It is recomputed from
the live set on every change, so teardown churn during navigation cannot leave a
stale winner. Do not switch to "last mounted wins" bookkeeping.

## Known limits

`$props.id()` regenerates across the handover. Pages using emplacement are not
streamed (the hook buffers, because a top-of-document anchor is filled by
content rendered lower down).

## Probes

- `probes/ssr.mjs` — real server pipeline through `hooks.ts`; writes
  `probes/.out/ssr.json`, which the hydration probe consumes so hydration is
  tested against real server output rather than a fixture.
- `probes/client.test.js` — registration timing, transitions, attachments,
  multi-outlet, snippet identity, ordering churn.
- `probes/hydrate.test.js` — mismatch-free hydration and the single-flush
  handover.
- `probes/boundary.test.js` — where errors surface.
- `probes/kit/` — SvelteKit app for SSR output, cross-request isolation and
  no-hook degradation. Run `npx vite dev` inside it and inspect the HTML.
- `probes/setup-waapi.js` — jsdom has no Web Animations API; Svelte transitions
  need `element.animate`. The stub mirrors only the surface Svelte touches.

Not covered: hydration in a real browser. jsdom covers the mechanism.
