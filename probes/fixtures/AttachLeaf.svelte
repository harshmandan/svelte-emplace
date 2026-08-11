<script>
	import { emplace } from 'svelte-emplace';

	let { to = undefined } = $props();
</script>

<span class="moved" {@attach emplace(to)}>moved</span>
<span class="stay">stayed</span>
