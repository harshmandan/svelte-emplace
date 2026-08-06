# svelte-emplace

Render content from a nested component into a distant outlet.

```bash
npm install svelte-emplace
```

Requires Svelte 5.

## Use

Create a handle in a module, so both sides share the same identity:

```js
// src/lib/slots.js
import { emplace } from 'svelte-emplace';

export const pageTitle = emplace();
export const toolbar = emplace({ mode: 'multiple' });
```

Put an outlet where the content should appear:

```svelte
<script>
	import { Out } from 'svelte-emplace';
	import { pageTitle } from '$lib/slots.js';
</script>

<header><h1><Out of={pageTitle} /></h1></header>
```

Emplace from anywhere below it:

```svelte
<script>
	import { In } from 'svelte-emplace';
	import { pageTitle } from '$lib/slots.js';
	let { data } = $props();
</script>

<In into={pageTitle}>{data.title}</In>
```

For server rendering, add the hook:

```js
// src/hooks.server.js
export { emplaceHandle as handle } from 'svelte-emplace/hooks';
```

## API

`emplace({ mode, key })` returns a handle.

- `mode: 'single'` (default) renders the winning `<In>`: highest `priority`, ties broken by
  most recently registered.
- `mode: 'multiple'` renders every `<In>`, ordered by `priority` then registration.
- `key` sets a stable id for the server anchor.

`<In into={handle} priority={0}>…</In>` emplaces its children and renders nothing where it is
written. `<Out of={handle} />` renders whatever was emplaced.

## License

MIT
