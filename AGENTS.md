# AGENTS.md

Read this before changing `src/lib`. It is 180 lines of code and four of them are
load-bearing in ways that look arbitrary.

## What this package is

Content is **created at its destination**, never moved there. `<Emplace>` mounts
its children into the target element. That single decision is the reason the
package exists: attachments and measurements see the real parent on their first
run, and nothing is re-parented, so iframes, video, focus and CSS animations are
not reset. Any change that relocates DOM after mount defeats the purpose.

## Four things found by probing, not reasoning

Each was measured, each silently breaks something if reverted, and each is
covered by `probes/emplace.test.js`. Run `bun run test` before and after changes.

1. **Mount inside an `$effect`; unmount in *that effect's* cleanup.** Doing the
   same work at init plus `onDestroy` suppresses the outro entirely — the content
   is torn down synchronously and no closing animation ever plays. This is a
   phase difference, not a preference.

2. **The snippet travels in a `$state` box, and the box is never written empty.**
   Props given to `mount()` are not live, so the box is what keeps a swapped
   snippet in sync. The `if (children)` guard matters because the sync effect runs
   once more with `children` undefined while the source is being torn down;
   writing that through blanks the destination before the outro can play.

3. **`children` must stay out of the mounting effect.** Reading it there makes a
   snippet swap tear the destination down and rebuild it, losing DOM state and
   replaying the intro. That is why the box is passed and the prop is not.

4. **Ordering uses comment anchors, not append order.** Each slot's content sits
   between its own comment and the next slot's, so `priority` holds no matter what
   order things mount in. See `claim`/`release` in `internal.ts`.

## Test environment

`bun test` runs against **jsdom**, wired up by hand in `probes/setup-bun.js`. Do
not switch to happy-dom: it does not implement enough of the transition path, so
Svelte's outros produce no keyframes there and every transition assertion passes
or fails for the wrong reason. This cost hours once.

Two related traps:

- Svelte emits a **zero-duration animation for the delay phase** before the real
  one. Counting animations is not enough — filter on `keyframes.length > 0` or you
  will "prove" an animation that nobody can see.
- The real animation is not created until a microtask after the removal. Assert
  after `await wait(0); flushSync()`.

jsdom has no Web Animations API at all, so `probes/setup-waapi.js` stubs exactly
the surface Svelte touches: `animate`, `getAnimations`, `onfinish`, `cancel`,
`effect`, `currentTime`, `playState`. It also records every call, which is how the
probes assert on real keyframes. `CustomEvent` and friends must come from jsdom's
realm — Bun defines its own, and jsdom rejects a foreign-realm event.

## Known parity limits, not bugs

- A transition inside a **nested block** does not animate when an ancestor block
  is removed. Verified identical in plain Svelte with nothing portaled at all, so
  it is not ours to fix. `E15` pins it so a future contributor does not chase it.
- `transition:` cannot be placed on `<Emplace>`; Svelte rejects transition
  directives on any component (upstream issue 11452).
- No server rendering. Emplaced content is client-only by design — see README.

## Site

`src/routes` is the landing page — a SvelteKit app (adapter-static, prerendered)
deployed to GitHub Pages by `deploy.yml`. It imports the library through `$lib`,
so the live demos run against the real source: a regression in `src/lib` breaks
the demos visibly. `bun run dev` to work on it, `bun run build:site` to build.
The library build (`bun run build`) and the probes do not involve it.

## Probes

`probes/emplace.test.js` covers destination resolution (name, selector, element,
fallback, multi-match), attachment timing and teardown, the closing animation
including real keyframes, reopen cleanliness, snippet swapping, priority ordering
under late mounts, and error bridging on both update and first render.
