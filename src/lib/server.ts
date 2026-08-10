import { AsyncLocalStorage } from 'node:async_hooks';
import { render } from 'svelte/server';
import Children from './Children.svelte';
import { NAME_ATTR, SSR_ATTR } from './internal.js';
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
	return als.run([], fn);
}

/**
 * Render everything collected during this request into the destinations in
 * `html`.
 *
 * Must run *after* the page has been rendered: `render()` from `svelte/server` is
 * lazy, so nothing is collected until its `.body` has been read.
 */
export function transformEmplacements(html: string): string {
	const store = als.getStore();
	if (!store?.length) return html;

	let body = html;
	let head = '';

	// Group by destination so several sources filling one spot are ordered
	// together, then rendered in one pass.
	const byName = new Map<string, ServerStore>();
	for (const input of store) {
		const list = byName.get(input.name);
		if (list) list.push(input);
		else byName.set(input.name, [input]);
	}

	for (const [name, inputs] of byName) {
		inputs.sort((a, b) => b.priority - a.priority);

		let inner = '';

		for (const [i, input] of inputs.entries()) {
			// `context` replays the tree the snippet was authored in, so `getContext`
			// works inside emplaced content. A distinct `idPrefix` keeps
			// `$props.id()` from colliding with the page's own ids.
			const piece = render(Children, {
				props: { children: input.children },
				context: input.context,
				idPrefix: `em${i}-${name}`
			});
			inner += piece.body;
			head += piece.head;
		}

		body = splice(body, name, `<div ${SSR_ATTR} style="display: contents">${inner}</div>`);
	}

	if (head) {
		const at = body.indexOf('</head>');
		if (at !== -1) body = body.slice(0, at) + head + body.slice(at);
	}

	return body;
}

/**
 * SvelteKit hook. Gives each request an isolated store, then fills the
 * destinations once the page HTML is complete.
 *
 * ```js
 * // src/hooks.server.js
 * export { emplaceHandle as handle } from 'svelte-emplace/server';
 * ```
 *
 * Chunks are buffered until the page is done, because a destination near the top
 * of the document is filled by content rendered further down. A page using
 * emplacement is therefore not streamed.
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

/**
 * Insert `content` inside every element carrying `data-emplace="name"`.
 *
 * The destination has to be empty for this to be unambiguous, which is also what
 * hydration requires — see the note in the README.
 */
function splice(html: string, name: string, content: string): string {
	const needle = `${NAME_ATTR}="${name}"`;
	let out = html;
	let at = 0;

	for (;;) {
		const found = out.indexOf(needle, at);
		if (found === -1) return out;

		// End of the opening tag, then its matching close.
		const tagOpen = out.lastIndexOf('<', found);
		const tagEnd = out.indexOf('>', found);
		if (tagOpen === -1 || tagEnd === -1) return out;

		const tag = /^<([a-zA-Z][\w-]*)/.exec(out.slice(tagOpen, tagEnd))?.[1];
		if (!tag) return out;

		const close = out.indexOf(`</${tag}>`, tagEnd);
		if (close === -1) return out;

		out = out.slice(0, close) + content + out.slice(close);
		at = close + content.length + tag.length + 3;
	}
}
