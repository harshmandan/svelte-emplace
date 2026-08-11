import { test, expect, beforeEach, afterEach } from 'bun:test';
import { mount, flushSync } from 'svelte';
import Attach from './fixtures/Attach.svelte';
import AttachMix from './fixtures/AttachMix.svelte';
import AttachTeardown from './fixtures/AttachTeardown.svelte';

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
	expect(texts('.att')).toEqual(['attached']);
});

// A8–A10 pin the teardown path. Svelte removes an unmounting block by walking the
// sibling range it recorded at mount; a moved node has left that range, so without
// the placeholder the attachment leaves behind it survives at its destination.
const teardown = (shape) => {
	document.body.innerHTML = '<aside data-emplace="tips"></aside>';
	mount(AttachTeardown, { target: document.body, props: { to: '@tips', shape } });
	flushSync();
	expect(document.querySelector('[data-emplace="tips"] > .moved')).toBeTruthy();

	globalThis.__t.close();
	flushSync();
};

test('A8: closing the block removes the moved element and its siblings', () => {
	teardown('inline');
	expect(document.querySelector('.moved')).toBe(null);
	expect(document.querySelector('.stay')).toBe(null);
	expect(document.querySelector('[data-emplace="tips"]').childNodes.length).toBe(0);
	expect(noise).toEqual([]);
});

test('A9: unmounting the owning component removes the moved element too', () => {
	teardown('component');
	expect(document.querySelector('.moved')).toBe(null);
	expect(document.querySelector('.stay')).toBe(null);
	expect(document.querySelector('[data-emplace="tips"]').childNodes.length).toBe(0);
	expect(noise).toEqual([]);
});

test('A10: two moved siblings are both removed', () => {
	teardown('pair');
	expect(texts('.moved')).toEqual([]);
	expect(document.querySelector('.stay')).toBe(null);
	expect(document.querySelector('[data-emplace="tips"]').childNodes.length).toBe(0);
	expect(noise).toEqual([]);
});

// A11–A12 pin the other half. Svelte can also remove the node itself — after an
// outro, or because the node is where the recorded range starts — before the
// attachment cleanup runs. Moving it home then would put a dead element back at
// the original position.
test('A11: a moved element with an out transition stays gone once the outro ends', async () => {
	teardown('out');
	await wait(300);
	flushSync();
	expect(document.querySelector('.moved')).toBe(null);
	expect(document.querySelector('main').children.length).toBe(0);
	expect(document.querySelector('[data-emplace="tips"]').childNodes.length).toBe(0);
	expect(noise).toEqual([]);
});

test('A12: the same without a transition leaves nothing at the original position', () => {
	teardown('alone');
	expect(document.querySelector('.moved')).toBe(null);
	expect(document.querySelector('main').children.length).toBe(0);
	expect(document.querySelector('[data-emplace="tips"]').childNodes.length).toBe(0);
	expect(noise).toEqual([]);
});
