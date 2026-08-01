import { AsyncLocalStorage } from 'node:async_hooks';
import { render } from 'svelte/server';
import Children from './Children.svelte';
import { OUT_ATTR, SSR_ATTR, pick } from './internal.js';
import { installStore, type ServerStore } from './registry.js';

const als = new AsyncLocalStorage<ServerStore>();
installStore(() => als.getStore());

type MaybePromise<T> = T | Promise<T>;

interface ResolveOptions {
	transformPageChunk?: (input: { html: string; done: boolean }) => MaybePromise<string | undefined>;
}

/** Structurally compatible with SvelteKit's `Handle`, without depending on it. */
interface HandleInput {
	event: unknown;
	resolve: (event: unknown, opts?: ResolveOptions) => MaybePromise<Response>;
}

/** Run `fn` with a fresh request-scoped store. For custom SSR setups. */
export function withEmplacements<T>(fn: () => T): T {
	return als.run(new Map(), fn);
}

/**
 * Render everything collected during the current request into the anchors in
 * `html`. Must run after the page has been rendered — `render()` is lazy, so
 * nothing is collected until its `.body` has been read.
 */
export function transformEmplacements(html: string): string {
	const store = als.getStore();
	if (!store?.size) return html;

	let body = html;
	let head = '';

	for (const [id, entry] of store) {
		let inner = '';

		for (const [i, input] of pick(entry.inputs, entry.mode).entries()) {
			// A fresh `idPrefix` per input keeps `$props.id()` from colliding with
			// the page's own ids. `context` replays the tree the snippet was
			// authored in, so `getContext` works inside emplaced content.
			const sink = render(Children, {
				props: { children: input.children },
				context: input.context,
				idPrefix: `em${id}-${i}`
			});
			inner += sink.body;
			head += sink.head;
		}

		body = splice(body, id, inner);
	}

	if (head) {
		const at = body.indexOf('</head>');
		if (at !== -1) body = body.slice(0, at) + head + body.slice(at);
	}

	return body;
}

/**
 * SvelteKit hook. Gives each request an isolated store and fills the anchors
 * once the page HTML is complete.
 *
 * ```js
 * // src/hooks.server.js
 * export { emplaceHandle as handle } from 'svelte-emplace/hooks';
 * ```
 *
 * Chunks are buffered until the page is done, because an anchor near the top of
 * the document is filled by content rendered further down. That means a page
 * using emplacement is not streamed.
 */
export const emplaceHandle = ({ event, resolve }: HandleInput): MaybePromise<Response> =>
	withEmplacements(() => {
		let buffer = '';

		return resolve(event, {
			transformPageChunk: ({ html, done }) => {
				buffer += html;
				if (!done) return '';
				return transformEmplacements(buffer);
			}
		});
	});

/** Insert `content` into the server-copy element of every anchor for `id`. */
function splice(html: string, id: string, content: string): string {
	const needle = `${OUT_ATTR}="${id}"`;
	let out = html;
	let at = 0;

	for (;;) {
		const anchor = out.indexOf(needle, at);
		if (anchor === -1) return out;

		const mark = out.indexOf(SSR_ATTR, anchor);
		const close = mark === -1 ? -1 : out.indexOf('</div>', mark);
		if (close === -1) return out;

		out = out.slice(0, close) + content + out.slice(close);
		at = close + content.length + '</div>'.length;
	}
}
