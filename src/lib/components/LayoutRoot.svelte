<script lang="ts">
	import { appRune } from '$lib/app.svelte';
	import { fly } from 'svelte/transition';
	import { quintIn, quintOut } from 'svelte/easing';

	let { children } = $props();
	// To be used for navigation highlighting
	let currentSection = $derived(appRune.section || '');
	let sections = $derived(appRune.sections);

	// Add state for mobile menu visibility
	let mobileMenuOpen = $state(false);

	// Toggle mobile menu function
	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	// Function to close the menu
	function closeMenu() {
		mobileMenuOpen = false;
	}
</script>

<div class="flex min-h-screen flex-col">
	<!-- Navigation -->
	<nav class="bg-white shadow-sm">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex h-16 justify-between">
				<div class="flex items-center">
					<div class="flex-shrink-0">
						<a href="/" class="text-primary-700 text-xl font-bold">Orchard Baseball</a>
					</div>
					<div class="hidden md:ml-6 md:flex md:space-x-6">
						{#each sections as section}
							<a
								href="/{section.slug}"
								class="hover:text-primary-700 rounded-md px-3 py-2 text-sm font-medium text-gray-700 {currentSection ===
								section.slug
									? 'text-primary-700 border-primary-500 border-b-2'
									: ''}"
							>
								{section.title}
							</a>
						{/each}
						<!-- Add Stopwatch link separately -->
						<a
							href="/stopwatch"
							class="hover:text-primary-700 rounded-md px-3 py-2 text-sm font-medium text-gray-700 {currentSection ===
							'stopwatch'
								? 'text-primary-700 border-primary-500 border-b-2'
								: ''}"
						>
							Stopwatch
						</a>
						<!-- Add Roster link separately -->
						<a
							href="/roster"
							class="hover:text-primary-700 rounded-md px-3 py-2 text-sm font-medium text-gray-700 {currentSection ===
							'roster'
								? 'text-primary-700 border-primary-500 border-b-2'
								: ''}"
						>
							Roster
						</a>
					</div>
				</div>
				<!-- Mobile menu button and stopwatch icon -->
				<div class="flex items-center space-x-2 md:hidden">
					<!-- Roster icon for mobile -->
					<a
						href="/roster"
						class="hover:text-primary-700 focus:ring-primary-500 inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 focus:ring-2 focus:outline-none focus:ring-inset"
					>
						<span class="sr-only">Roster</span>
						<svg
							class="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							aria-hidden="true"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
							/>
						</svg>
					</a>
					<!-- Stopwatch icon for mobile -->
					<a
						href="/stopwatch"
						class="hover:text-primary-700 focus:ring-primary-500 inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 focus:ring-2 focus:outline-none focus:ring-inset"
					>
						<span class="sr-only">Stopwatch</span>
						<svg
							class="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							aria-hidden="true"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</a>
					<!-- Menu button -->
					<button
						type="button"
						class="hover:text-primary-700 focus:ring-primary-500 inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 focus:ring-2 focus:outline-none focus:ring-inset"
						aria-expanded="false"
						onclick={toggleMobileMenu}
					>
						<span class="sr-only">Open main menu</span>
						<!-- Icon when menu is closed -->
						{#if !mobileMenuOpen}
							<svg
								class="h-6 w-6"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
								/>
							</svg>
						{:else}
							<!-- Icon when menu is open -->
							<svg
								class="h-6 w-6"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
							</svg>
						{/if}
					</button>
				</div>
			</div>
		</div>
	</nav>

	<!-- Mobile navigation (dropdown menu) -->
	{#if mobileMenuOpen}
		<div class="md:hidden">
			<div class="absolute z-10 w-full space-y-1 bg-white px-2 pt-2 pb-4 shadow-lg sm:px-3">
				{#each sections as section}
					<a
						href="/{section.slug}"
						onclick={closeMenu}
						class="hover:text-primary-700 block rounded-md px-3 py-2 text-base font-medium text-gray-700 {currentSection ===
						section.slug
							? 'text-primary-700 bg-primary-50'
							: ''}"
					>
						{section.title}
					</a>
				{/each}
				<!-- Add Stopwatch link separately -->
				<a
					href="/stopwatch"
					onclick={closeMenu}
					class="hover:text-primary-700 block rounded-md px-3 py-2 text-base font-medium text-gray-700 {currentSection ===
					'stopwatch'
						? 'text-primary-700 bg-primary-50'
						: ''}"
				>
					Stopwatch
				</a>
				<!-- Add Roster link separately -->
				<a
					href="/roster"
					onclick={closeMenu}
					class="hover:text-primary-700 block rounded-md px-3 py-2 text-base font-medium text-gray-700 {currentSection ===
					'roster'
						? 'text-primary-700 bg-primary-50'
						: ''}"
				>
					Roster
				</a>
			</div>
		</div>
	{/if}

	<!-- Content -->
	<main class="flex-grow">
		{@render children()}
	</main>

	<!-- Footer -->
	<footer class="border-t border-gray-200 bg-gray-50">
		<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
			<div class="flex flex-col justify-between md:flex-row md:items-center">
				<div class="mb-4 md:mb-0">
					<p class="text-sm text-gray-600">© {new Date().getFullYear()} Orchard Baseball Team</p>
					<p class="mt-1 text-xs text-gray-500">
						Building better players through knowledge and practice
					</p>
				</div>
				<div class="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-6">
					{#each sections as section}
						<a href="/{section.slug}" class="text-primary-600 hover:text-primary-800 text-sm">
							{section.title}
						</a>
					{/each}
					<a href="/" class="text-primary-600 hover:text-primary-800 text-sm">Home</a>
					<!-- Add Stopwatch link to footer as well -->
					<a href="/stopwatch" class="text-primary-600 hover:text-primary-800 text-sm">Stopwatch</a>
					<!-- Add Roster link to footer as well -->
					<a href="/roster" class="text-primary-600 hover:text-primary-800 text-sm">Roster</a>
				</div>
			</div>
		</div>
	</footer>
</div>
