import { test, expect, beforeEach, afterEach } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import { emplace } from 'svelte-emplace';
import Harness from './fixtures/Harness.svelte';
import Swap from './fixtures/Swap.svelte';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
let noise;

beforeEach(() => {
	document.body.innerHTML = '';
	noise = [];
	const w = console.warn, e = console.error, t = console.trace;
	console.warn = (...a) => noise.push('warn: ' + a.join(' '));
	console.error = (...a) => noise.push('error: ' + a.join(' '));
	console.trace = () => {};
	afterEach(() => { console.warn = w; console.error = e; console.trace = t; });
});

const html = () => document.body.innerHTML;
const inHeader = (sel) => !!document.querySelector('header ' + sel);

test('A5: <In> registers at init; outlet has content by first flush', () => {
	const e = emplace();
	mount(Harness, { target: document.body, props: { e } });
	flushSync();
	expect(inHeader('.a')).toBe(true);
	expect(document.querySelector('main .a')).toBe(null);
	expect(noise).toEqual([]);
});

test('A16: one <In> renders into two outlets, both reactive', () => {
	const e = emplace();
	mount(Harness, { target: document.body, props: { e, twoOuts: true } });
	flushSync();
	expect(document.querySelectorAll('.a').length).toBe(2);
	globalThis.__probe.bump();
	flushSync();
	const texts = [...document.querySelectorAll('.a')].map((n) => n.textContent.trim());
	console.log('A16 texts:', texts);
	expect(texts).toEqual(['A n=1', 'A n=1']);
	expect(noise).toEqual([]);
});

test('A17: swapping snippet identity propagates', () => {
	const e = emplace();
	mount(Swap, { target: document.body, props: { e } });
	flushSync();
	expect(document.querySelector('header .sn').textContent).toBe('SNIP-A');
	globalThis.__swap('b');
	flushSync();
	expect(document.querySelector('header .sn').textContent).toBe('SNIP-B');
	expect(noise).toEqual([]);
});
