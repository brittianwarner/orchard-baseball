<script>
	// Receive all frontmatter properties as props, children could be undefined
	let { title, description, section, subsection, layout, children = undefined } = $props();

	// Determine layout type from frontmatter or fallback to "page"
	let layoutType = $derived(layout || 'page');
</script>

{#if layoutType === 'section'}
	<div class="bg-green-50 py-16">
		<div class="mx-auto max-w-6xl px-4">
			{#if title}
				<h1 class="mb-4 text-4xl font-bold text-green-900">{title}</h1>
			{/if}
			{#if description}
				<p class="max-w-3xl text-xl text-green-700">{description}</p>
			{/if}
		</div>
	</div>
{:else if layoutType === 'subsection'}
	<div class="bg-green-600 py-12">
		<div class="mx-auto max-w-6xl px-4">
			{#if section}
				<div class="mb-2 font-medium text-green-50">
					{section}
				</div>
			{/if}
			{#if title}
				<h1 class="mb-3 text-3xl font-bold text-white">{title}</h1>
			{/if}
			{#if description}
				<p class="max-w-3xl text-lg text-green-100">{description}</p>
			{/if}
		</div>
	</div>
{:else}
	<!-- Default page layout -->
	<div class="border-b border-green-200 bg-white py-8">
		<div class="mx-auto max-w-6xl px-4">
			{#if section || subsection}
				<div class="mb-1 flex items-center text-sm text-green-600">
					{#if section}
						<span>{section}</span>
					{/if}
					{#if section && subsection}
						<span class="mx-2">›</span>
					{/if}
					{#if subsection}
						<span>{subsection}</span>
					{/if}
				</div>
			{/if}
			{#if title}
				<h1 class="mb-2 text-2xl font-bold text-green-900">{title}</h1>
			{/if}
			{#if description}
				<p class="text-md max-w-3xl text-green-700">{description}</p>
			{/if}
		</div>
	</div>
{/if}

<article
	class="prose-sm md:prose lg:prose-lg prose-ul:list-disc prose-ul:pl-5 prose-li:marker:text-green-500 prose-li:my-0
		prose-ol:list-decimal prose-ol:pl-5 prose-li prose-li:pl-1
		prose-li:prose-ul:list-circle prose-li:prose-ul:mt-2
		prose-li:prose-ol:mt-2 prose-li:prose-li:prose-ul:list-square
		prose-li prose-li:marker:text-green-400
		mx-auto
		max-w-4xl
		px-4 py-8"
>
	<div class="mt-4">
		<!-- Use slot as fallback to make this work with mdsvex -->
		{@render children()}
	</div>
</article>
