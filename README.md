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
target, and iframes, video and input state are never reset. 180 lines, no dependencies.

## Quick start

```sh
npm i svelte-emplace
```

> Requires Svelte `^5`.

```svelte
<script>
  import { Emplace } from 'svelte-emplace';
</script>

<Emplace>
  <div class="modal" transition:fade>…</div>
</Emplace>
```

Without a `to` prop, content renders into a shared container at the end of `<body>` — the usual
place for modals and toasts.

## Targets

Mark an element with `data-emplace` and refer to it by name:

```svelte
<h1 data-emplace="title"></h1>
```

```svelte
<Emplace to="title">{data.title}</Emplace>
```

`to` also accepts a CSS selector or an element reference:

```svelte
<Emplace to="#tooltips">…</Emplace>
<Emplace to={element}>…</Emplace>
```

A string starting with `#`, `.` or `[` is treated as a selector; any other string is a name,
matching `[data-emplace="name"]`. If no target matches, content falls back to the `<body>`
container.

If several elements share a name, the content renders into **all** of them — for example, a
mobile and a desktop header filled from the same source.

## Ordering

When several `<Emplace>` components target the same element, `priority` sets the order: higher
renders first, ties keep registration order, and the order holds no matter when each component
mounts.

```svelte
<Emplace to="toolbar" priority={10}><button>Save</button></Emplace>
<Emplace to="toolbar"><button>Cancel</button></Emplace>
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

## Server rendering (optional)

Off by default. Add the hook and content aimed at a **name** is rendered into that
destination in the server HTML:

```js
// src/hooks.server.js
export { emplaceHandle as handle } from 'svelte-emplace/server';
```

Nothing in your components changes. `<Emplace to="title">` now appears inside
`<h1 data-emplace="title">` in the first response, with `getContext` and
`<svelte:head>` working from inside emplaced content.

Only names are server-rendered. CSS selectors, element targets and the body layer
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
| `to` | — | target name, CSS selector, or element. Omit for the `<body>` container |
| `priority` | `0` | higher renders first within the same target |
| `children` | — | content to render at the target |

## Notes

- No server-side rendering: content mounts in the browser only. Anything that must be in the
  initial HTML belongs in your layout instead.
- `to` is resolved once, when the content mounts. If the target is not in the DOM yet, the
  content falls back to the `<body>` container and stays there.

## License

MIT
