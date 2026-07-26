import { fileURLToPath } from 'node:url';
import { svelte } from '@sveltejs/vite-plugin-svelte';

const lib = fileURLToPath(new URL('./src/lib', import.meta.url));

// Probes import the public entry points, so they exercise the shipped surface.
export const alias = [
	{ find: /^svelte-emplace\/hooks$/, replacement: lib + '/hooks.ts' },
	{ find: /^svelte-emplace$/, replacement: lib + '/index.ts' }
];

export default {
	plugins: [svelte()],
	resolve: { conditions: ['browser'], alias },
	test: {
		environment: 'jsdom',
		globals: true,
		setupFiles: ['./probes/setup-waapi.js'],
		include: ['probes/**/*.test.js']
	}
};
