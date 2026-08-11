<div align="center">

  <img src="./static/icon-large.svg" alt="svelte-emplace" width="100" />

  <h1>svelte-emplace</h1>

[![version](https://img.shields.io/npm/v/svelte-emplace.svg)](https://www.npmjs.com/package/svelte-emplace)
[![downloads](http://img.shields.io/npm/dm/svelte-emplace.svg)](https://www.npmjs.com/package/svelte-emplace)

[**Examples and docs →**](https://svelte-emplace.harsh.ink)

</div>

A portal component for Svelte 5. `<Emplace>` mounts its children directly into a target element
elsewhere in the DOM, instead of rendering them in place and moving the node. Because nothing is
re-parented, positioning code measures the right parent on its first run, transitions play at the
target, and iframes, video and input state are never reset. Around 220 lines, no dependencies.

## Quick start

```sh
npm i svelte-emplace
```

> Requires Svelte `^5`.

```svelte
<script>
  import Emplace from 'svelte-emplace';
</script>

<Emplace>
  <div class="modal" transition:fade>…</div>
</Emplace>
```

Without a `to` prop, content renders into a shared container at the end of `<body>` — the usual
place for modals and toasts.

The component is the default export — the same import shape as svelte-portal — and a named one:
`import { Emplace, emplace } from 'svelte-emplace'` also works.

## Targets

Mark an element with `data-emplace` and refer to it by name, prefixed with `@`:

```svelte
<h1 data-emplace="title"></h1>
```

```svelte
<Emplace to="@title">{data.title}</Emplace>
```

Any other string is passed to `querySelector`, so every selector works — tag names included —
and an element reference is used as-is:

```svelte
<Emplace to="#tooltips">…</Emplace>
<Emplace to="dialog-container">…</Emplace>
<Emplace to={element}>…</Emplace>
```

The `@` prefix is unambiguous because CSS reserves `@` for at-rules — no selector can start
with it. If no target matches (or the selector is invalid), content falls back to the `<body>`
container and a warning names the `to` that did not resolve.

## Several targets at once

`multiple` gives every element `to` matches its own live copy — a mobile and a desktop header
filled from one source:

```svelte
<h1 data-emplace="title"></h1>
<h1 data-emplace="title"></h1>
```

```svelte
<Emplace to="@title" multiple>{data.title}</Emplace>
```

## Ordering

When several `<Emplace>` components target the same element, `priority` sets the order: higher
renders first, ties keep registration order, and the order holds no matter when each component
mounts.

```svelte
<Emplace to="@toolbar" priority={10}><button>Save</button></Emplace>
<Emplace to="@toolbar"><button>Cancel</button></Emplace>
```

## Error boundaries

Content renders at the target, but errors still propagate to the `<svelte:boundary>` around the
`<Emplace>` that created it, so your fallback renders and the rest of the page keeps working:

```svelte
<svelte:boundary onerror={report}>
  {#snippet failed()}<p>Could not open</p>{/snippet}
  <Emplace><Modal /></Emplace>
</svelte:boundary>
```

## Transitions

Put the transition on an element inside `<Emplace>`. Intro and outro both play, at the target:

```svelte
<Emplace><div transition:fly={{ y: 20 }}>…</div></Emplace>
```

Svelte does not allow `transition:` on a component, so it cannot go on `<Emplace>` itself.

## The `emplace` attachment

For a single element you already have, the `emplace` attachment does the same job without a
wrapper component:

```svelte
<script>
  import { emplace } from 'svelte-emplace';
</script>

<div class="tip" {@attach emplace('@tips')}>…</div>
```

The arguments mirror the component: `@name`, a CSS selector, or an element — omit it for the
`<body>` container — and an optional priority, `emplace('@toolbar', 10)`, which sorts against
`<Emplace>` content in the same target.

One difference is structural: an attachment receives an element that already exists, so the
element is created in place and **moved** to its destination — the re-parenting `<Emplace>`
avoids. That is fine for a tooltip or an overlay; when the content holds live state (an iframe,
a video, a focused input) or should be server-rendered, use the component. Two smaller
consequences:

- A node can only be in one place, so there is no `multiple` here.
- Attachments run in declaration order, so ones written after `{@attach emplace(…)}` already see
  the element at its destination.

`{@attach}` needs Svelte 5.29 or newer.

## Server rendering (optional)

Off by default. Add the hook and content aimed at a **name** is rendered into that
destination in the server HTML:

```js
// src/hooks.server.js
export { emplaceHandle as handle } from 'svelte-emplace/server';
```

Nothing in your components changes. `<Emplace to="@title">` now appears inside
`<h1 data-emplace="title">` in the first response, with `getContext` and
`<svelte:head>` working from inside emplaced content.

Only `@name` targets are server-rendered. CSS selectors, element targets and the body layer
need a DOM, so they stay client-only and appear after hydration — which is also
what a modal or tooltip wants.

Three things to know:

- **The destination element must be empty**, like the `<h1>` above. That is what
  makes the splice point unambiguous, and what keeps hydration valid.
- **A page using it is not streamed.** A destination near the top of the document
  is filled by content rendered further down, so the response is buffered.
- **`$props.id()` inside emplaced content is regenerated on the client**, because
  the destination re-renders rather than hydrating the server copy. References
  within the content stay consistent; one from outside pointing in will not.

Without the hook everything still works — the content just appears after
hydration, and you get one warning telling you so.

## API

| prop | default | |
|---|---|---|
| `to` | — | `@name`, CSS selector, or element. Omit for the `<body>` container |
| `priority` | `0` | higher renders first within the same target |
| `multiple` | `false` | fill every element `to` matches, each with its own copy |
| `children` | — | content to render at the target |

The `emplace(to?, priority?)` attachment takes those first two values as arguments.

## Notes

- Server rendering is opt-in. Without the hook, content mounts in the browser only. The
  attachment is always client-only: the element renders at its source position in the server
  HTML and moves when the page hydrates.
- `to` is resolved once, when the content mounts. If the target is not in the DOM yet, the
  content falls back to the `<body>` container and stays there. That case and a target that has
  been renamed away look the same from the inside, so both log one warning naming the `to` —
  once per distinct value, not once per mount.

## Upgrading from 1.x

`to` now resolves to one element. In 1.x a `to` matching several elements filled all of them,
which made a selector that was meant for one destination quietly fan out — a tag or class name
matching a second, nested copy of a component rendered the content twice.

Add `multiple` wherever you relied on that:

```diff
-<Emplace to="@title">{data.title}</Emplace>
+<Emplace to="@title" multiple>{data.title}</Emplace>
```

Only targets you deliberately duplicated need it. An unresolvable `to` still falls back to the
`<body>` container, but now warns instead of doing it silently.

## License

MIT
