<script>
	import { getContext } from 'svelte';
	const c = getContext('ctx') ?? 'MISSING';
	const uid = $props.id();
</script>

<svelte:head><meta name="emplaced" content="yes" /></svelte:head>
<b class="ctx">{c}</b><i class="uid">{uid}</i>
