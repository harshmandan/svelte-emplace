<script>
	import { In } from 'svelte-emplace';
	import { pageTitle, toolbar } from '../lib-slots.js';
</script>

<In into={pageTitle}>Home</In>
<In into={toolbar}><button>Alpha</button></In>
<In into={toolbar}><button>Beta</button></In>
<p>home body</p>
