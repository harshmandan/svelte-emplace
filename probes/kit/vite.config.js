import { fileURLToPath } from 'node:url';
import { sveltekit } from '@sveltejs/kit/vite';

const lib = fileURLToPath(new URL('../../src/lib', import.meta.url));

export default {
	plugins: [sveltekit()],
	resolve: {
		alias: [
			{ find: /^svelte-emplace\/hooks$/, replacement: lib + '/hooks.ts' },
			{ find: /^svelte-emplace$/, replacement: lib + '/index.ts' }
		]
	}
};
