export async function load({ url }) {
	const title = url.searchParams.get('title') ?? 'Slow';
	const delay = Number(url.searchParams.get('delay') ?? 0);
	await new Promise((r) => setTimeout(r, delay));
	return { title };
}
