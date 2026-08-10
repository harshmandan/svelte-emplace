import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

const lib = fileURLToPath(new URL('../src/lib', import.meta.url));
const server = await createServer({
	plugins: [svelte()], configFile: false, appType: 'custom',
	server: { middlewareMode: true }, logLevel: 'error',
	resolve: { alias: [{ find: /^svelte-emplace$/, replacement: lib + '/index.ts' }] }
});
const { render } = await server.ssrLoadModule('svelte/server');
const { withEmplacements, transformEmplacements } = await server.ssrLoadModule('/src/lib/server.ts');
const App = (await server.ssrLoadModule('/probes/fixtures/ShapeApp.svelte')).default;
const doc = withEmplacements(() => {
	const r = render(App, { idPrefix: 'p' });
	return transformEmplacements(`<!doctype html><html><head></head><body>${r.body}</body></html>`);
});
mkdirSync('probes/.out', { recursive: true });
writeFileSync('probes/.out/shapes.json', JSON.stringify({ body: doc.match(/<body>([\s\S]*)<\/body>/)[1] }));
console.log('shapes ssr written');
await server.close();
