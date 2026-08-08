import { readFileSync } from 'node:fs';
import { plugin, Transpiler } from 'bun';
import { JSDOM } from 'jsdom';
import { compile, compileModule } from 'svelte/compiler';

// compileModule() parses JS, not TS, so types come off first.
const ts = new Transpiler({ loader: 'ts' });

// jsdom, not happy-dom. happy-dom does not implement enough of the transition
// path: Svelte's outros silently produce no keyframes there, so every transition
// assertion passes or fails for the wrong reason.
const dom = new JSDOM('<!doctype html><html><body></body></html>', { pretendToBeVisual: true });

globalThis.window = dom.window;
globalThis.document = dom.window.document;

// These must come from jsdom's realm even though Bun already defines them.
// Svelte's transition code constructs a CustomEvent and dispatches it; a
// foreign-realm event is rejected by jsdom with "parameter 1 is not of type
// 'Event'".
const FORCE = [
	'Event',
	'CustomEvent',
	'EventTarget',
	'Node',
	'Element',
	'HTMLElement',
	'SVGElement',
	'DocumentFragment',
	'Comment',
	'Text',
	'NodeList',
	'HTMLCollection',
	'CSSStyleDeclaration',
	'MutationObserver',
	'DOMParser',
	'Range',
	'getComputedStyle',
	'requestAnimationFrame',
	'cancelAnimationFrame'
];

for (const key of FORCE) {
	if (key in dom.window) globalThis[key] = dom.window[key];
}

for (const key of Object.getOwnPropertyNames(dom.window)) {
	if (key in globalThis) continue;
	try {
		globalThis[key] = dom.window[key];
	} catch {
		// a few jsdom globals are getter-only; none that we need
	}
}

// `bun test` has no Svelte transform of its own. Rather than take on a plugin
// dependency, hand the files to Svelte's own compiler. `generate: 'client'`
// pairs with the `browser` condition that selects Svelte's client runtime.
plugin({
	name: 'svelte',
	setup(build) {
		build.onLoad({ filter: /\.svelte$/ }, ({ path }) => ({
			contents: compile(readFileSync(path, 'utf8'), { filename: path, generate: 'client', dev: true })
				.js.code,
			loader: 'js'
		}));

		build.onLoad({ filter: /\.svelte\.(js|ts)$/ }, ({ path }) => ({
			contents: compileModule(ts.transformSync(readFileSync(path, 'utf8')), {
				filename: path,
				generate: 'client',
				dev: true
			}).js.code,
			loader: 'js'
		}));
	}
});
