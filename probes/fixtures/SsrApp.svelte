<script>
	import { setContext } from 'svelte';
	import { In, Out } from 'svelte-emplace';
	import SsrLeaf from './SsrLeaf.svelte';

	let { e, title = 'Emplaced title' } = $props();
	setContext('ctx', 'ctx-ok');
</script>

<header>SHELL<Out of={e} /></header>
<main><In into={e}><h1 class="tp">{title}</h1><SsrLeaf /></In></main>
