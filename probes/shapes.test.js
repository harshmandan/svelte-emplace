import { readFileSync } from 'node:fs';
import { test } from 'bun:test';
import { flushSync, hydrate } from 'svelte';
import ShapeApp from './fixtures/ShapeApp.svelte';

const ssr = JSON.parse(readFileSync('probes/.out/shapes.json', 'utf8'));

test('which destination shapes survive hydration', () => {
	const warns = [];
	const w = console.warn;
	console.warn = (...a) => warns.push(a.join(' '));
	document.body.innerHTML = ssr.body;
	hydrate(ShapeApp, { target: document.body });
	flushSync();
	console.warn = w;

	for (const [id, want] of [['only', 'A'], ['textbefore', 'before B'], ['textafter', 'C after'],
		['both', 'before D after'], ['elemafter', 'Ex'], ['inline', 'before F after']]) {
		const got = document.querySelector('#' + id).textContent.replace(/\s+/g, ' ').trim();
		console.log(`  ${id.padEnd(11)} want "${want}"  got "${got}"  ${got === want ? 'OK' : 'BROKEN'}`);
	}
	console.log('  hydration warnings:', warns.length);
});
