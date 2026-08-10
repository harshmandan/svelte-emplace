import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// Static site (GitHub Pages). The library itself is published via `svelte-package`.
		adapter: adapter(),
		paths: {
			// Set BASE_PATH=/svelte-emplace in CI so assets resolve under <user>.github.io/svelte-emplace/.
			base: process.env.BASE_PATH ?? ''
		}
	}
};

export default config;
