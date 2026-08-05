<script>
	import { In } from 'svelte-emplace';
	import { pageTitle } from '../../lib-slots.js';
	let { data } = $props();
</script>

<In into={pageTitle}>{data.title}</In>
<p>slow body</p>
