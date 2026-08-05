<script>
	import { Out } from 'svelte-emplace';
	import { pageTitle, toolbar } from '../lib-slots.js';
	let { children } = $props();
</script>

<header>
	<h1 id="shell-title"><Out of={pageTitle} /></h1>
	<nav id="shell-tools"><Out of={toolbar} /></nav>
	<aside id="mobile-title"><Out of={pageTitle} /></aside>
</header>
<main>{@render children()}</main>
