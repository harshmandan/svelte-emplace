import { test, expect, beforeEach, afterEach } from 'bun:test';
import { mount, flushSync } from 'svelte';
import EmplaceDefault, { Emplace } from 'svelte-emplace';
import Modal from './fixtures/Modal.svelte';
import Stack from './fixtures/Stack.svelte';
import Swap from './fixtures/Swap.svelte';
import Nested from './fixtures/Nested.svelte';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const texts = (sel) => [...document.querySelectorAll(sel)].map((n) => n.textContent);

let noise;
let saved;

beforeEach(() => {
	document.body.innerHTML = '';
	noise = [];
	saved = [console.warn, console.error, console.trace];
	console.warn = (...a) => noise.push('warn: ' + a.join(' '));
	console.error = (...a) => noise.push('error: ' + a.join(' '));
	console.trace = () => {};
});

afterEach(() => {
	[console.warn, console.error, console.trace] = saved;
});

test('E1: with no `to`, content lands in an auto-created body layer', () => {
	mount(Modal, { target: document.body });
	flushSync();
	const layer = document.querySelector('body > [data-emplace-layer]');
	expect(layer).toBeTruthy();
	expect(layer.querySelector('.body')?.textContent).toBe('content');
	expect(document.querySelector('main .body')).toBe(null);
	expect(noise).toEqual([]);
});

test('E2: an @name resolves to [data-emplace="name"]', () => {
	document.body.innerHTML = '<aside data-emplace="tips"></aside>';
	mount(Modal, { target: document.body, props: { to: '@tips' } });
	flushSync();
	expect(document.querySelector('[data-emplace="tips"] .body')).toBeTruthy();
	expect(document.querySelector('[data-emplace-layer]')).toBe(null);
});

test('E3: a CSS selector resolves to that element', () => {
	document.body.innerHTML = '<div id="dest"></div>';
	mount(Modal, { target: document.body, props: { to: '#dest' } });
	flushSync();
	expect(document.querySelector('#dest .body')).toBeTruthy();
});

test('E4: an element can be passed directly', () => {
	const el = document.createElement('div');
	el.id = 'direct';
	document.body.append(el);
	mount(Modal, { target: document.body, props: { to: el } });
	flushSync();
	expect(document.querySelector('#direct .body')).toBeTruthy();
});

test('E5: an unresolvable destination falls back to the body layer', () => {
	mount(Modal, { target: document.body, props: { to: '#nope' } });
	flushSync();
	expect(document.querySelector('[data-emplace-layer] .body')).toBeTruthy();
	expect(noise).toEqual([]);
});

test('E6: one source feeds every element matching the name', () => {
	document.body.innerHTML =
		'<div id="a" data-emplace="title"></div><div id="b" data-emplace="title"></div>';
	mount(Modal, { target: document.body, props: { to: '@title' } });
	flushSync();
	expect(document.querySelector('#a .body')).toBeTruthy();
	expect(document.querySelector('#b .body')).toBeTruthy();
});

test('E7: attachment runs against the destination, and tears down on close', async () => {
	mount(Modal, { target: document.body });
	flushSync();
	expect(globalThis.__m.attached).toEqual([{ parent: 'layer', connected: true }]);

	globalThis.__m.close();
	flushSync();
	await wait(250);
	expect(globalThis.__m.detached).toBe(1);
	expect(noise).toEqual([]);
});

test('E8: the outro plays at the destination and delays removal', async () => {
	mount(Modal, { target: document.body });
	flushSync();
	await wait(150);

	globalThis.__m.close();
	flushSync();
	expect(document.querySelector('[data-emplace-layer] .body')).toBeTruthy();
	await wait(300);
	expect(document.querySelector('[data-emplace-layer] .body')).toBe(null);
	expect(noise).toEqual([]);
});

test('E9: closing then reopening leaves no leftovers', async () => {
	mount(Modal, { target: document.body });
	flushSync();
	globalThis.__m.close();
	flushSync();
	await wait(300);
	globalThis.__m.openIt();
	flushSync();
	await wait(150);
	expect(texts('[data-emplace-layer] .body')).toEqual(['content']);
});

test('E10: swapping the snippet updates the destination', () => {
	mount(Swap, { target: document.body });
	flushSync();
	expect(texts('[data-emplace-layer] .body')).toEqual(['content']);
	globalThis.__swap();
	flushSync();
	expect(texts('[data-emplace-layer] .body')).toEqual(['swapped']);
	expect(noise).toEqual([]);
});

test('E11: DOM order follows priority, not mount order', () => {
	mount(Stack, { target: document.body });
	flushSync();
	expect(texts('[data-emplace-layer] .s')).toEqual(['high', 'mid', 'low']);

	globalThis.__stack();
	flushSync();
	expect(texts('[data-emplace-layer] .s')).toEqual(['high', 'late', 'mid', 'low']);
	expect(noise).toEqual([]);
});

test('E12: an error in emplaced content reaches the source boundary', async () => {
	mount(Modal, { target: document.body });
	flushSync();
	globalThis.__m.boom();
	flushSync();
	await wait(0);
	flushSync();
	expect(globalThis.__m.caught).toEqual(['source:boom-from-emplaced']);
	expect(document.querySelector('.src-failed')).toBeTruthy();
	expect(document.querySelector('[data-emplace-layer] .body')).toBe(null);
});

test('E13: an error on the first render also reaches the source boundary', async () => {
	mount(Modal, { target: document.body, props: { boomFromStart: true } });
	flushSync();
	await wait(0);
	flushSync();
	expect(globalThis.__m.caught).toEqual(['source:boom-from-emplaced']);
	expect(document.querySelector('.src-failed')).toBeTruthy();
});

test('E14: the closing animation really animates, not just lingers', async () => {
	mount(Modal, { target: document.body });
	flushSync();
	await wait(150);

	globalThis.__resetAnimations();
	globalThis.__m.close();
	flushSync();
	await wait(0);
	flushSync();

	// Svelte emits a zero-duration animation for the delay phase first, so assert
	// on the one that carries keyframes — that is the animation you can see.
	const outro = globalThis.__animations
		.filter((a) => a.el?.classList?.contains('body'))
		.filter((a) => a.keyframes?.length > 0);

	expect(outro.length).toBe(1);
	expect(outro[0].opts.duration).toBe(100);
	expect(outro[0].keyframes.some((k) => 'opacity' in k)).toBe(true);
	expect(document.querySelector('[data-emplace-layer] .body')).toBeTruthy();

	await wait(300);
	expect(document.querySelector('[data-emplace-layer] .body')).toBe(null);
});

test('E15: Svelte itself skips outros in nested blocks — parity, not a defect', async () => {
	// Documented so nobody "fixes" it. A transition inside a block nested in the
	// emplaced content does not animate when an ancestor block is removed, which
	// is how plain Svelte behaves with nothing portaled at all.
	mount(Nested, { target: document.body });
	flushSync();
	await wait(150);

	globalThis.__resetAnimations();
	globalThis.__nested();
	flushSync();

	expect(globalThis.__animations.filter((a) => a.el?.classList?.contains('n')).length).toBe(0);
});

test('E16: a bare string is a plain querySelector, so a tag name matches', () => {
	// The svelte-portal migration case: `to` names a custom element directly.
	document.body.innerHTML = '<question-bottom-container></question-bottom-container>';
	mount(Modal, { target: document.body, props: { to: 'question-bottom-container' } });
	flushSync();
	expect(document.querySelector('question-bottom-container .body')).toBeTruthy();
	expect(document.querySelector('[data-emplace-layer]')).toBe(null);
	expect(noise).toEqual([]);
});

test('E17: an invalid selector falls back to the body layer instead of throwing', () => {
	mount(Modal, { target: document.body, props: { to: '((' } });
	flushSync();
	expect(document.querySelector('[data-emplace-layer] .body')).toBeTruthy();
	expect(noise).toEqual([]);
});

test('E18: the component is the default export as well as a named one', () => {
	// The svelte-portal import shape: `import Emplace from 'svelte-emplace'`.
	expect(EmplaceDefault).toBe(Emplace);
});
