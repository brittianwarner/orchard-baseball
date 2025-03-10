import { error } from '@sveltejs/kit';
import { getPage } from '$lib/content/index';
import type { Section } from '$lib/app.svelte';

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
	// Get the path from params
	const { page } = params;

	try {
		// Use the consolidated getPage function to get content for this path
		return await getPage(page);
	} catch (err) {
		// Handle errors by converting them to proper SvelteKit errors
		console.error(`Error loading path "${page}":`, err);
		const message = err instanceof Error ? err.message : `Could not find "${page}"`;
		throw error(404, message);
	}
}

/** @type {import('./$types').EntryGenerator} */
export async function entries() {
	const entries = [];

	// Add root entry (home page)
	entries.push({ page: '' });

	// Get sections data
	const pageData = await getPage();
	const sectionsData = pageData.sections as Section[];

	// Generate entries for each section/subsection/page from the sections data
	for (const section of sectionsData) {
		// Add section entry
		entries.push({ page: section.slug });

		for (const subsection of section.subsections) {
			// Add subsection entry
			entries.push({ page: `${section.slug}/${subsection.slug}` });

			// Add page entries
			for (const page of subsection.pages) {
				entries.push({ page: `${section.slug}/${subsection.slug}/${page.slug}` });
			}
		}
	}

	return entries;
}

export const prerender = true;
