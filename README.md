<div align="center">

  <img src="./site/icon-large.svg" alt="svelte-emplace" width="280" />

  <h1>svelte-emplace</h1>

[![version](https://img.shields.io/npm/v/svelte-emplace.svg)](https://www.npmjs.com/package/svelte-emplace)
[![downloads](http://img.shields.io/npm/dm/svelte-emplace.svg)](https://www.npmjs.com/package/svelte-emplace)

[**Examples and docs →**](https://harshmandan.github.io/svelte-emplace/)

</div>

**The best portal for Svelte 5.** Put a modal, tooltip or toast anywhere on the page. Content is
mounted straight into its target, so positions, focus and closing animations are right the first
time. **180 lines, zero dependencies.**

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

One import, one component, no props. Content goes into a shared layer at the end of `<body>`,
which is what a modal or a toast wants.

## Choosing a destination

Mark a spot in your own markup, then aim at it by name:

```svelte
<h1 data-emplace="title"></h1>
```

```svelte
<Emplace to="title">{data.title}</Emplace>
```

`to` also takes a CSS selector or an element:

```svelte
<Emplace to="#tooltips">…</Emplace>
<Emplace to={element}>…</Emplace>
```

A string starting with `#`, `.` or `[` is treated as a selector; anything else is a name,
matching `[data-emplace="name"]`. If nothing matches, content falls back to the body layer.

If several elements share one name, the content renders into **all** of them — one source
feeding a mobile and a desktop header at once.

## Ordering

Several parts of your app can fill one spot. `priority` fixes the order: higher sorts first,
ties keep registration order, and it holds regardless of what mounts when.

```svelte
<Emplace to="toolbar" priority={10}><button>Save</button></Emplace>
<Emplace to="toolbar"><button>Cancel</button></Emplace>
```

## Errors

Content renders at its destination, but a `<svelte:boundary>` in the tree that *wrote* it still
catches its errors, so your own fallback shows and the rest of the page keeps working.

```svelte
<svelte:boundary onerror={report}>
  {#snippet failed()}<p>Could not open</p>{/snippet}
  <Emplace><Modal /></Emplace>
</svelte:boundary>
```

## Transitions

Put the transition on your own element inside `<Emplace>`. Opening and closing both animate, at
the destination.

```svelte
<Emplace><div transition:fly={{ y: 20 }}>…</div></Emplace>
```

Svelte does not allow `transition:` on a component, so it cannot go on `<Emplace>` itself.

## API

| prop | default | |
|---|---|---|
| `to` | — | a name, a CSS selector, or an element. Omit for the body layer |
| `priority` | `0` | higher sorts first at the destination |
| `children` | — | what gets emplaced |

## Notes

- Emplaced content is client only. A modal opens on a click and a tooltip on a hover, so there is
  nothing to send with the first page load. For text in the first HTML, use your layout.
- `to` is resolved once, when the content is created. If that element is not in the page yet, the
  content goes to the body layer and stays there.

## License

MIT
