# svelte-emplace

Put a modal, tooltip or toast anywhere on the page. Content is mounted straight into its
target, so measurements, focus and closing animations are right the first time.

```bash
npm install svelte-emplace
```

Requires Svelte 5.

## Quick start

```svelte
<script>
	import { Emplace } from 'svelte-emplace';
</script>

<Emplace>
	<div class="modal" transition:fade>…</div>
</Emplace>
```

One import, one component, no props. Content goes into a shared layer at the end of `<body>`.

## Choosing a destination

`to` takes a name, a CSS selector, or an element:

```svelte
<h1 data-emplace="title"></h1>
```

```svelte
<Emplace to="title">{data.title}</Emplace>
<Emplace to="#tooltips">…</Emplace>
<Emplace to={element}>…</Emplace>
```

A string starting with `#`, `.` or `[` is a selector; anything else is a name, matching
`[data-emplace="name"]`. If nothing matches, content goes to the body layer.

If several elements share a name, the content renders into all of them.

## Ordering

`priority` orders several sources at one destination. Higher sorts first, ties keep
registration order, and the order holds regardless of what mounts when.

```svelte
<Emplace to="toolbar" priority={10}><button>Save</button></Emplace>
<Emplace to="toolbar"><button>Cancel</button></Emplace>
```

## Errors

A `<svelte:boundary>` in the tree that wrote the content catches its errors.

```svelte
<svelte:boundary onerror={report}>
	{#snippet failed()}<p>Could not open</p>{/snippet}
	<Emplace><Modal /></Emplace>
</svelte:boundary>
```

## Transitions

Put the transition on your own element inside `<Emplace>`. Opening and closing both animate.

```svelte
<Emplace><div transition:fly={{ y: 20 }}>…</div></Emplace>
```

Svelte does not allow `transition:` on a component, so it cannot go on `<Emplace>` itself.

## Notes

- Emplaced content is client only. There is no server rendering.
- `to` is resolved once, when the content is created. If that element is not in the page yet,
  the content goes to the body layer and stays there.

## License

MIT
