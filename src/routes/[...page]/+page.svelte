<script lang="ts">
	import type { Post } from '$lib/content';

	let { data } = $props();

	// Determine the content type based on the data properties
	let contentType = $derived(
		data.content ? 'page' : data.posts ? 'subsection' : data.sectionData ? 'section' : 'notFound'
	);

	// Extract relevant data based on content type
	const section = $derived(data.section);
	const subsection = $derived(data.subsection);
	const sectionData = $derived(data.sectionData);
	const subsectionData = $derived(data.subsectionData);
	const posts = $derived(data.posts || []);
	const content = $derived(data.content);
	const meta = $derived(data.meta || {});

	// Function to ensure pages are in the same order as in index.ts
	function getOrderedPages(posts: Post[], subsectionData: { pages?: { slug: string }[] }) {
		if (!posts || posts.length === 0) return [];
		if (!subsectionData || !subsectionData.pages) return posts;

		// Create a map of slug -> orderIndex from subsectionData.pages
		const orderMap = new Map<string, number>();
		subsectionData.pages.forEach((page: { slug: string }, index: number) => {
			orderMap.set(page.slug, index);
		});

		// Sort posts based on the order defined in subsectionData
		return [...posts].sort((a, b) => {
			const orderA = orderMap.has(a.slug) ? orderMap.get(a.slug)! : Number.MAX_SAFE_INTEGER;
			const orderB = orderMap.has(b.slug) ? orderMap.get(b.slug)! : Number.MAX_SAFE_INTEGER;
			return orderA - orderB;
		});
	}

	// Sort the posts to match the order in index.ts if possible
	const orderedPosts = $derived(getOrderedPages(posts, subsectionData));
</script>

{#if contentType === 'section' && sectionData}
	<div class="bg-primary-50 py-16">
		<div class="mx-auto max-w-6xl px-4">
			<h1 class="text-primary-900 mb-4 text-4xl font-bold">{sectionData.title}</h1>
			<p class="text-primary-700 max-w-3xl text-xl">
				{sectionData.description}
			</p>
		</div>
	</div>

	<div class="mx-auto max-w-6xl px-4 py-10">
		<div class="grid gap-8 md:grid-cols-2">
			{#each sectionData.subsections as subsection}
				<div
					class="rounded-lg border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
				>
					<div class="block">
						<a href="/{sectionData.slug}/{subsection.slug}" class="block">
							<h3 class="text-primary-800 mb-2 text-xl font-semibold">{subsection.title}</h3>
							<p class="mb-4 text-gray-600">{subsection.description}</p>
						</a>

						{#if subsection.pages && subsection.pages.length > 0}
							<div class="mt-4 space-y-1">
								{#each subsection.pages as page}
									<a
										href="/{sectionData.slug}/{subsection.slug}/{page.slug}"
										class="text-primary-600 hover:text-primary-800 block py-1 hover:underline"
									>
										{page.title}
									</a>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</div>
{:else if contentType === 'subsection' && sectionData && subsectionData}
	<div class="bg-primary-100 py-12">
		<div class="mx-auto max-w-6xl px-4">
			<div class="text-primary-700 mb-2 font-medium">
				<a href="/{section}" class="hover:underline">{sectionData.title}</a>
			</div>
			<h1 class="text-primary-900 mb-3 text-3xl font-bold">{subsectionData.title}</h1>
			<p class="text-primary-700 max-w-3xl text-lg">
				{subsectionData.description}
			</p>
		</div>
	</div>

	<div class="mx-auto max-w-6xl px-4 py-10">
		<!-- Display posts from content system -->
		{#if posts.length > 0}
			<div class="grid gap-4 md:grid-cols-1">
				{#each orderedPosts as post}
					<div
						class="rounded-lg border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
					>
						<a href="/{section}/{subsection}/{post.slug}" class="block">
							<h3 class="text-primary-800 mb-2 text-lg font-semibold">{post.title}</h3>
							{#if post.description}
								<p class="text-gray-600">{post.description}</p>
							{/if}
						</a>
					</div>
				{/each}
			</div>
		{:else}
			<!-- Fallback to static pages data -->
			<div class="grid gap-4 md:grid-cols-1">
				{#each subsectionData.pages as page}
					<div
						class="rounded-lg border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
					>
						<a href="/{section}/{subsection}/{page.slug}" class="block">
							<h3 class="text-primary-800 mb-2 text-lg font-semibold">{page.title}</h3>
							<p class="text-gray-600">{page.description}</p>
						</a>
					</div>
				{/each}
			</div>
		{/if}
	</div>
{:else if contentType === 'page' && content}
	{@const Content = content}

	<!-- Content section -->
	<div class="">
		<Content />
	</div>
{:else}
	<div class="bg-red-50 py-16">
		<div class="mx-auto max-w-6xl px-4">
			<h1 class="mb-4 text-4xl font-bold text-red-700">Page Not Found</h1>
			<p class="max-w-3xl text-xl text-red-600">
				Sorry, the page you are looking for does not exist or has been moved.
			</p>
			<a href="/" class="mt-4 inline-block rounded bg-red-600 px-4 py-2 text-white">Return Home</a>
		</div>
	</div>
{/if}
