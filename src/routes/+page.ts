import { getPage } from '$lib/content/index';

/** @type {import('./$types').PageLoad} */
export async function load() {
	// Get the sections data for the home page
	return await getPage();
}

export const prerender = true;
