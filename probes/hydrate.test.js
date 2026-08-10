import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, expect, test } from 'bun:test';
import { flushSync, hydrate } from 'svelte';
import SsrApp from './fixtures/SsrApp.svelte';

// Real server output, produced by `bun probes/ssr.mjs`.
const ssr = JSON.parse(readFileSync('probes/.out/ssr.json', 'utf8'));

let noise;
let saved;

beforeEach(() => {
	noise = [];
	saved = [console.warn, console.error, console.trace];
	console.warn = (...a) => noise.push('warn: ' + a.join(' '));
	console.error = (...a) => noise.push('error: ' + a.join(' '));
	console.trace = () => {};
});

afterEach(() => {
	[console.warn, console.error, console.trace] = saved;
});

test('S1: server output puts the content in the destination', () => {
	document.body.innerHTML = ssr.body;
	expect(document.querySelector('header h1').textContent).toContain('Quarterly report');
	expect(document.querySelector('main').textContent.trim()).toBe('');
	expect([...document.querySelectorAll('nav button')].map((b) => b.textContent)).toEqual([
		'Save',
		'Cancel'
	]);
});

test('S2: hydrates with no mismatch, no duplication, server copy handed over', () => {
	document.body.innerHTML = ssr.body;
	hydrate(SsrApp, { target: document.body, props: { title: 'Quarterly report' } });
	flushSync();

	// Measured synchronously: the handover must complete in the same flush.
	expect(document.querySelectorAll('header h1 .ctx').length).toBe(1);
	expect(document.querySelector('header h1').textContent).toContain('Quarterly report');
	expect([...document.querySelectorAll('nav button')].map((b) => b.textContent)).toEqual([
		'Save',
		'Cancel'
	]);
	expect(document.querySelector('[data-emplace-ssr]')).toBe(null);
	expect(noise).toEqual([]);
});

test('S3: a client-only target still works after hydration', () => {
	document.body.innerHTML = ssr.body;
	hydrate(SsrApp, { target: document.body, props: { title: 'Quarterly report' } });
	flushSync();
	// `to="#not-a-name"` matches nothing, so it lands in the body layer.
	expect(document.querySelector('[data-emplace-layer]').textContent).toContain('client only');
	expect(noise).toEqual([]);
});

