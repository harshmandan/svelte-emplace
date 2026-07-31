// Probe: the real server pipeline, through the shipped `hooks.ts` code path.
//   render -> page renders; <Out> emits an anchor, <In> emits nothing but
//             registers itself in the request-scoped store
//   fill   -> transformEmplacements() renders each collected snippet with its
//             captured context and splices it into the anchor
// Writes the result to probes/.out/ssr.json so the hydration probe runs against
// real server output rather than a hand-written fixture.
import { mkdirSync, writeFileSync } from 'node:fs';
import { createServer } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { alias } from '../vite.config.js';

const server = await createServer({
	plugins: [svelte()],
	resolve: { alias },
	configFile: false,
	appType: 'custom',
	server: { middlewareMode: true },
	logLevel: 'error'
});

const load = (p) => server.ssrLoadModule(p);
const { render } = await load('svelte/server');
const { emplace } = await load('svelte-emplace');
const { withEmplacements, transformEmplacements } = await load('svelte-emplace/hooks');
const SsrApp = (await load('/probes/fixtures/SsrApp.svelte')).default;

const e = emplace({ key: 't' });

const doc = withEmplacements(() => {
	const result = render(SsrApp, { props: { e }, idPrefix: 'p' });
	// `render()` is lazy — it returns `{ get head(), get body() }` and the
	// component bodies do not execute until a property is read, so nothing is
	// collected until this line.
	const html = `<!doctype html><html><head>${result.head}</head><body>${result.body}</body></html>`;
	return transformEmplacements(html);
});

const body = doc.match(/<body>([\s\S]*)<\/body>/)[1];
const head = doc.match(/<head>([\s\S]*)<\/head>/)[1];

mkdirSync('probes/.out', { recursive: true });
writeFileSync('probes/.out/ssr.json', JSON.stringify({ body, head, id: e.id }, null, 2));

console.log('BODY >>>', body);
console.log('HEAD >>>', JSON.stringify(head));

await server.close();
