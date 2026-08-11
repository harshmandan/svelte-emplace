<script>
	import { setContext } from 'svelte';
	import { Emplace } from 'svelte-emplace';
	import SsrLeaf from './SsrLeaf.svelte';
	let { title = 'Quarterly report' } = $props();
	setContext('ctx', 'ctx-ok');
</script>

<header>SHELL<h1 data-emplace="title"></h1></header>
<nav data-emplace="tools"></nav>
<footer><i data-emplace="badge"></i><i data-emplace="badge"></i></footer>
<aside><b data-emplace="solo"></b><b data-emplace="solo"></b></aside>
<main>
	<Emplace to="@title">{title}<SsrLeaf /></Emplace>
	<Emplace to="@tools" priority={10}><button>Save</button></Emplace>
	<Emplace to="@tools"><button>Cancel</button></Emplace>
	<Emplace to="@badge" multiple>BADGE</Emplace>
	<Emplace to="@solo">SOLO</Emplace>
	<Emplace to="#not-a-name">client only</Emplace>
</main>
