<script lang="ts">
	/** @type {import('./$types').PageData} */
	export let data;

	// Get sections from the page data
	const { sections } = data;
</script>

<div class="bg-green-50 py-16">
	<div class="mx-auto max-w-6xl px-4">
		<img
			src="/logo.png"
			alt="Orchard Baseball Logo"
			class="mb-6 h-32 rounded-xl bg-[#2a5c2f] p-2"
		/>
		<h1 class="mb-4 text-4xl font-bold text-green-900">Orchard Baseball Team</h1>
		<p class="max-w-3xl text-xl text-green-700">
			Welcome to the Orchard Baseball Team instructional guide. Here you'll find all the information
			you need to learn, improve, and excel at baseball.
		</p>
	</div>
</div>

<div class="mx-auto max-w-6xl px-4 py-10">
	<h2 class="mb-8 text-2xl font-semibold text-gray-900">Table of Contents</h2>

	<div class="grid gap-8 md:grid-cols-2">
		{#each sections as section}
			<div
				class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-green-200 hover:shadow-md"
			>
				<div class="block">
					<a href="/{section.slug}" class="block">
						<h3 class="mb-2 text-xl font-semibold text-gray-900">{section.title}</h3>
						<p class="mb-4 text-gray-600">{section.description}</p>
					</a>

					{#if section.subsections && section.subsections.length > 0}
						<div class="mt-2 space-y-1">
							{#each section.subsections as subsection}
								<a
									href="/{section.slug}/{subsection.slug}"
									class="block py-1 text-gray-700 transition-colors hover:text-green-700 hover:underline"
								>
									{subsection.title}
								</a>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>
