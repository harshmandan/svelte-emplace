import { readFileSync } from 'node:fs';
import { test, expect, beforeEach } from 'vitest';
import { hydrate, flushSync } from 'svelte';
import { emplace } from 'svelte-emplace';
import SsrApp from './fixtures/SsrApp.svelte';

// Real server output, produced by `node probes/ssr.mjs`.
const ssr = JSON.parse(readFileSync('probes/.out/ssr.json', 'utf8'));

let noise;
beforeEach(() => {
	noise = [];
	const w = console.warn, er = console.error, tr = console.trace;
	console.warn = (...a) => noise.push('warn: ' + a.join(' '));
	console.error = (...a) => noise.push('error: ' + a.join(' '));
	console.trace = () => {};
	return () => { console.warn = w; console.error = er; console.trace = tr; };
});

test('A9/A10: hydrates server output with zero mismatch and no duplication', () => {
	document.body.innerHTML = ssr.body;

	// Sanity: the server really did put the content in the destination.
	expect(document.querySelector('header .tp')?.textContent).toBe('Emplaced title');
	expect(document.querySelector('main .tp')).toBe(null);
	const ssrUid = document.querySelector('.uid').textContent;

	const e = emplace({ key: ssr.id });
	hydrate(SsrApp, { target: document.body, props: { e, title: 'Emplaced title' } });
	flushSync();

	// A10: measured synchronously — the handover must complete in the same flush,
	// never leaving two copies (double paint) or zero copies (flash of nothing).
	expect(document.querySelectorAll('.tp').length).toBe(1);
	expect(document.querySelector('header .tp')?.textContent).toBe('Emplaced title');
	expect(document.querySelector('[data-emplace-ssr]')).toBe(null);

	// A9: hydration produced no warnings or errors at all.
	expect(noise).toEqual([]);

	// A11: record whether $props.id() survives the handover.
	const clientUid = document.querySelector('.uid').textContent;
	console.log('A11 ssr uid:', ssrUid, '| client uid:', clientUid, '| stable:', ssrUid === clientUid);
});

test('A9b: hydration is stable when the outlet stays empty (no <In> on this route)', () => {
	// Same shell, but the server collected nothing, so the anchor has no ssr copy.
	document.body.innerHTML = ssr.body.replace(/(<div data-emplace-ssr[^>]*>)[\s\S]*?(<\/div>)/, '$1$2');
	const e = emplace({ key: ssr.id });
	hydrate(SsrApp, { target: document.body, props: { e, title: 'Late title' } });
	flushSync();
	expect(document.querySelectorAll('.tp').length).toBe(1);
	expect(document.querySelector('header .tp')?.textContent).toBe('Late title');
	expect(noise).toEqual([]);
});
