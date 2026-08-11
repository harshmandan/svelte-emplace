import { test, expect, beforeEach, afterEach } from 'bun:test';
import { mount, flushSync } from 'svelte';
import Attach from './fixtures/Attach.svelte';
import AttachMix from './fixtures/AttachMix.svelte';

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

test('A1: the attachment moves the element into a named destination, no wrapper', () => {
	document.body.innerHTML = '<aside data-emplace="tips"></aside>';
	mount(Attach, { target: document.body, props: { to: '@tips' } });
	flushSync();
	expect(document.querySelector('[data-emplace="tips"] > .att')).toBeTruthy();
	expect(document.querySelector('main .att')).toBe(null);
	expect(noise).toEqual([]);
});

test('A2: with no argument, the element lands in the body layer', () => {
	mount(Attach, { target: document.body });
	flushSync();
	expect(document.querySelector('body > [data-emplace-layer] > .att')).toBeTruthy();
	expect(noise).toEqual([]);
});

test('A3: attachments declared after emplace already see the destination', () => {
	document.body.innerHTML = '<aside data-emplace="tips"></aside>';
	mount(Attach, { target: document.body, props: { to: '@tips' } });
	flushSync();
	expect(globalThis.__a.parents).toEqual(['tips']);
});

test('A4: attachment and component content sort together by priority', () => {
	mount(AttachMix, { target: document.body });
	flushSync();
	expect(texts('#mix .s')).toEqual(['attach-10', 'component-5', 'attach-0']);
	expect(noise).toEqual([]);
});

test('A5: changing the destination moves the element and leaves nothing behind', () => {
	document.body.innerHTML = '<div data-emplace="one"></div><div data-emplace="two"></div>';
	mount(Attach, { target: document.body, props: { to: '@one' } });
	flushSync();
	expect(document.querySelector('[data-emplace="one"] > .att')).toBeTruthy();

	globalThis.__a.retarget('@two');
	flushSync();
	expect(document.querySelector('[data-emplace="two"] > .att')).toBeTruthy();
	expect(document.querySelector('[data-emplace="one"]').childNodes.length).toBe(0);
	expect(noise).toEqual([]);
});

test('A6: the outro plays at the destination, then the target is left empty', async () => {
	document.body.innerHTML = '<aside data-emplace="tips"></aside>';
	mount(Attach, { target: document.body, props: { to: '@tips' } });
	flushSync();
	await wait(150);

	globalThis.__a.close();
	flushSync();
	expect(document.querySelector('[data-emplace="tips"] .att')).toBeTruthy();

	await wait(300);
	expect(document.querySelector('[data-emplace="tips"] .att')).toBe(null);
	expect(document.querySelector('[data-emplace="tips"]').childNodes.length).toBe(0);
	expect(noise).toEqual([]);
});

test('A7: closing then reopening leaves exactly one copy', async () => {
	document.body.innerHTML = '<aside data-emplace="tips"></aside>';
	mount(Attach, { target: document.body, props: { to: '@tips' } });
	flushSync();
	globalThis.__a.close();
	flushSync();
	await wait(300);
	globalThis.__a.openIt();
	flushSync();
	await wait(150);
	expect(texts('[data-emplace="tips"] .att')).toEqual(['attached']);
});
