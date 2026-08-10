<script>
	import { Emplace } from 'svelte-emplace';
</script>

<div id="only"><span data-emplace="a"></span></div>
<div id="textbefore">before <span data-emplace="b"></span></div>
<div id="textafter"><span data-emplace="c"></span> after</div>
<div id="both">before <span data-emplace="d"></span> after</div>
<div id="elemafter"><span data-emplace="e"></span><b>x</b></div>
<p id="inline">before <span data-emplace="f"></span> after</p>

<Emplace to="a">A</Emplace>
<Emplace to="b">B</Emplace>
<Emplace to="c">C</Emplace>
<Emplace to="d">D</Emplace>
<Emplace to="e">E</Emplace>
<Emplace to="f">F</Emplace>
