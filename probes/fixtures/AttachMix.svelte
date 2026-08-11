<script>
	import { Emplace, emplace } from 'svelte-emplace';
</script>

<div id="mix" data-emplace="mix"></div>

<main>
	<Emplace to="@mix" priority={5}><span class="s">component-5</span></Emplace>
	<span class="s" {@attach emplace('@mix', 10)}>attach-10</span>
	<span class="s" {@attach emplace('@mix')}>attach-0</span>
</main>
