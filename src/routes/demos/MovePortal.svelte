<script>
	// What a move-based portal does: render in place inside a wrapper <div>
	// for a handle, then append that wrapper to the target once everything
	// underneath has mounted. Kept here so the comparisons run against the
	// real technique instead of a dependency.
	let { to, children } = $props();

	function move(/** @type {HTMLElement} */ node) {
		to?.appendChild(node);
		return {
			destroy() {
				node.remove();
			}
		};
	}
</script>

<div use:move>{@render children()}</div>
