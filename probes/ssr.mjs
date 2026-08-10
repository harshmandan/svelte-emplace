// Probe: the real server pipeline, through the shipped `server.ts` code path.
import { mkdirSync, writeFileSync } from 'node:fs';
import { createServer } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { fileURLToPath } from 'node:url';

const lib = fileURLToPath(new URL('../src/lib', import.meta.url));
const server = await createServer({
	plugins: [svelte()],
	configFile: false,
	appType: 'custom',
	server: { middlewareMode: true },
	logLevel: 'error',
	resolve: { alias: [{ find: /^svelte-emplace$/, replacement: lib + '/index.ts' }] }
});

const load = (p) => server.ssrLoadModule(p);
const { render } = await load('svelte/server');
const { withEmplacements, transformEmplacements } = await load('/src/lib/server.ts');
const App = (await load('/probes/fixtures/SsrApp.svelte')).default;

const doc = withEmplacements(() => {
	const r = render(App, { idPrefix: 'p' });
	// `render()` is lazy; reading .body is what runs the components and fills the store.
	const html = `<!doctype html><html><head>${r.head}</head><body>${r.body}</body></html>`;
	return transformEmplacements(html);
});

const body = doc.match(/<body>([\s\S]*)<\/body>/)[1];
const head = doc.match(/<head>([\s\S]*)<\/head>/)[1];

mkdirSync('probes/.out', { recursive: true });
writeFileSync('probes/.out/ssr.json', JSON.stringify({ body, head }, null, 2));

console.log('HEADER >>>', body.match(/<header>[\s\S]*?<\/header>/)[0]);
console.log('NAV    >>>', body.match(/<nav[\s\S]*?<\/nav>/)[0]);
console.log('MAIN   >>>', body.match(/<main>[\s\S]*?<\/main>/)[0]);
console.log('HEAD   >>>', JSON.stringify(head));

await server.close();
