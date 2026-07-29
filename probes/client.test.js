import { test, expect, beforeEach, afterEach } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import { emplace } from 'svelte-emplace';
import Harness from './fixtures/Harness.svelte';
import Swap from './fixtures/Swap.svelte';
import Fade from './fixtures/Fade.svelte';

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

test('A7: attachments fire natively, with the destination node', async () => {
	const e = emplace();
	mount(Harness, { target: document.body, props: { e } });
	flushSync();
	const { attached } = globalThis.__probe;
	expect(attached.length).toBe(1);
	expect(attached[0].closest('header')).toBeTruthy();
	globalThis.__probe.setA(false);
	flushSync();
	await wait(200);
	expect(globalThis.__probe.detached).toBe(1);
	expect(noise).toEqual([]);
});

test('A6: transitions native — intro on client add, outro delays removal', async () => {
	const e = emplace();
	globalThis.__resetAnimations();
	mount(Fade, { target: document.body, props: { e } });
	flushSync();

	const introAnims = globalThis.__animations.filter((a) => a.el.classList?.contains('f'));
	console.log('A6 intro animations:', introAnims.length, JSON.stringify(introAnims[0]?.keyframes?.slice(0, 2)));
	expect(introAnims.length).toBeGreaterThan(0);
	expect(introAnims[0].el.closest('header')).toBeTruthy();
	await wait(200);

	globalThis.__resetAnimations();
	globalThis.__fade(false);
	flushSync();
	await wait(0); // unregistration is deliberately deferred one microtask
	flushSync();
	const outroAnims = globalThis.__animations.filter((a) => a.el.classList?.contains('f'));
	console.log('A6 outro animations:', outroAnims.length, 'node still present:', !!document.querySelector('header .f'));
	expect(outroAnims.length).toBeGreaterThan(0);
	expect(document.querySelector('header .f')).toBeTruthy(); // outro animating, not instant
	await wait(300);
	console.log('A6 after outro, node present:', !!document.querySelector('header .f'));
	expect(document.querySelector('header .f')).toBe(null);
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

test('A18: winner survives navigation churn (new mounts before old destroys)', async () => {
	const e = emplace();
	mount(Harness, { target: document.body, props: { e } });
	flushSync();
	expect(inHeader('.a')).toBe(true);

	globalThis.__probe.setB(true); // "new page" registers
	flushSync();
	expect(inHeader('.b')).toBe(true);
	expect(inHeader('.a')).toBe(false);

	globalThis.__probe.setA(false); // "old page" tears down afterwards
	flushSync();
	await wait(200);
	console.log('A18 final:', html().match(/<header>[\s\S]*?<\/header>/)?.[0]);
	expect(inHeader('.b')).toBe(true);
	expect(inHeader('.a')).toBe(false);
	expect(noise).toEqual([]);
});
