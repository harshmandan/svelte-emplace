import { test, expect } from 'vitest';
import { mount, flushSync } from 'svelte';
import { emplace } from 'svelte-emplace';
import BoundaryApp from './fixtures/BoundaryApp.svelte';

test('A8: a boundary around <Out> catches errors thrown by emplaced content', () => {
	const e = emplace();
	mount(BoundaryApp, { target: document.body, props: { e } });
	flushSync();
	expect(document.querySelector('header .ok')?.textContent).toBe('ok');

	globalThis.__setBoom();
	flushSync();

	console.log('A8 caught:', JSON.stringify(globalThis.__caught));
	console.log('A8 dest failed snippet:', !!document.querySelector('.failed-dest'));
	console.log('A8 src failed snippet:', !!document.querySelector('.failed-src'));

	// The content renders in the destination tree, so that is where it throws.
	expect(globalThis.__caught).toEqual(['destination:boom-from-emplaced']);
	expect(document.querySelector('.failed-dest')).toBeTruthy();
	expect(document.querySelector('.failed-src')).toBe(null);
});
