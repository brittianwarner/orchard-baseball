<script lang="ts">
	// Using Svelte 5 runes for state management
	import { fly, fade } from 'svelte/transition';
	import { stopwatchRune } from '$lib/app.svelte';
	import { onMount } from 'svelte';
	import autoAnimate from '@formkit/auto-animate';

	// Define interface for saved stopwatch data
	interface SavedStopwatch {
		id: string;
		startTime: number;
		elapsedTime: number;
		isRunning: boolean;
		laps: { index: number; time: number; lapTime: number }[];
		previousLapTime: number;
		createdAt: number;
		note?: string;
	}

	// State for saved stopwatches and note input
	let savedStopwatches = $state<SavedStopwatch[]>([]);
	let isLoadingSaved = $state(false);
	let newNote = $state('');
	let showNoteInput = $state(false);
	let selectedGroup = $state<string>('all'); // Filter option
	let isMobile = $state(false); // Detect mobile devices
	let isHistoryExpanded = $state(false); // Whether history section is expanded
	let visibleStopwatches = $state<SavedStopwatch[]>([]); // Stopwatches currently visible

	// Check if device is mobile on mount
	onMount(() => {
		checkIfMobile();
		window.addEventListener('resize', checkIfMobile);
		return () => window.removeEventListener('resize', checkIfMobile);
	});

	function checkIfMobile() {
		isMobile = window.innerWidth < 768;
	}

	// Group stopwatches by date
	function groupStopwatchesByDate(watches: SavedStopwatch[]) {
		const groups: { [key: string]: SavedStopwatch[] } = {};

		// Create groups
		for (const watch of watches) {
			if (!watch.createdAt) continue;

			const date = new Date(watch.createdAt);
			const today = new Date();
			const yesterday = new Date();
			yesterday.setDate(yesterday.getDate() - 1);

			let groupKey = '';

			// Today
			if (date.toDateString() === today.toDateString()) {
				groupKey = 'Today';
			}
			// Yesterday
			else if (date.toDateString() === yesterday.toDateString()) {
				groupKey = 'Yesterday';
			}
			// This week
			else if (date.getTime() > today.getTime() - 7 * 24 * 60 * 60 * 1000) {
				groupKey = 'This Week';
			}
			// This month
			else if (date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) {
				groupKey = 'This Month';
			}
			// Earlier
			else {
				groupKey = 'Earlier';
			}

			if (!groups[groupKey]) {
				groups[groupKey] = [];
			}

			groups[groupKey].push(watch);
		}

		return groups;
	}

	// Computed value for grouped stopwatches
	$effect(() => {
		// Group data is recalculated whenever savedStopwatches changes
		groupedStopwatches = groupStopwatchesByDate(savedStopwatches);

		// Update the visible stopwatches based on expansion state
		updateVisibleStopwatches();
	});

	let groupedStopwatches = $state<{ [key: string]: SavedStopwatch[] }>({});

	// Update the visible stopwatches based on expansion state and selected group
	function updateVisibleStopwatches() {
		if (selectedGroup === 'all') {
			// If showing all, limit to 5 when collapsed or all when expanded
			visibleStopwatches = isHistoryExpanded ? savedStopwatches : savedStopwatches.slice(0, 5);
		} else {
			// If showing a specific group, filter and then limit
			const groupWatches = groupedStopwatches[selectedGroup] || [];
			visibleStopwatches = isHistoryExpanded ? groupWatches : groupWatches.slice(0, 5);
		}
	}

	// Toggle history expansion
	function toggleHistoryExpansion() {
		isHistoryExpanded = !isHistoryExpanded;
		updateVisibleStopwatches();
	}

	// When filter group changes, update visible stopwatches
	$effect(() => {
		updateVisibleStopwatches();
	});

	// Load saved stopwatches
	async function loadSavedStopwatches(): Promise<void> {
		isLoadingSaved = true;
		try {
			savedStopwatches = await stopwatchRune.getSavedStopwatches();
			updateVisibleStopwatches();
		} catch (error) {
			console.error('Error loading saved stopwatches:', error);
		} finally {
			isLoadingSaved = false;
		}
	}

	// Load a specific stopwatch
	async function loadStopwatch(id: string): Promise<void> {
		await stopwatchRune.loadFromKV(id);
	}

	// Delete a saved stopwatch
	async function deleteStopwatch(id: string, event: Event): Promise<void> {
		event.stopPropagation(); // Prevent triggering the load action
		try {
			await fetch('/api/stopwatch', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ id })
			});
			// Refresh the list
			await loadSavedStopwatches();
		} catch (error) {
			console.error('Error deleting stopwatch:', error);
		}
	}

	// Start the timer with optional note
	async function startTimer(): Promise<void> {
		await stopwatchRune.toggleTimer(newNote);
		// Clear the note input after starting
		newNote = '';
		showNoteInput = false;
		// Load saved stopwatches to show the new one
		await loadSavedStopwatches();
	}

	// Load saved stopwatches on component mount
	onMount(() => {
		loadSavedStopwatches();

		// Auto-save every 10 seconds if the stopwatch is running
		const saveInterval = setInterval(() => {
			if (stopwatchRune.isRunning) {
				stopwatchRune.saveToKV();
			}
		}, 10000);

		return () => {
			clearInterval(saveInterval);
		};
	});

	// Effect to update timer when running
	$effect(() => {
		if (stopwatchRune.isRunning) {
			stopwatchRune.timerInterval = setInterval(() => {
				stopwatchRune.elapsedTime = Date.now() - stopwatchRune.startTime;
			}, 10) as unknown as number;
		} else if (stopwatchRune.timerInterval !== null) {
			clearInterval(stopwatchRune.timerInterval);
			stopwatchRune.timerInterval = null;
		}

		// Cleanup when component is destroyed
		return () => {
			if (stopwatchRune.timerInterval !== null) {
				clearInterval(stopwatchRune.timerInterval);
			}
		};
	});

	// Format date for display
	function formatDate(timestamp: number): string {
		if (!timestamp) return '';
		const date = new Date(timestamp);

		// Get time in 12-hour format with AM/PM
		return date.toLocaleTimeString(undefined, {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		});
	}

	// Format date for display with day and month
	function formatFullDate(timestamp: number): string {
		if (!timestamp) return '';
		const date = new Date(timestamp);

		return date.toLocaleDateString(undefined, {
			month: 'short',
			day: 'numeric'
		});
	}

	// Toggle note input visibility
	function toggleNoteInput(): void {
		showNoteInput = !showNoteInput;
		if (!showNoteInput) {
			newNote = '';
		}
	}
</script>

<div class="mx-auto flex max-w-4xl flex-col items-center px-4 py-4 md:py-8">
	<!-- Main stopwatch container - always visible -->
	<div
		class="w-full overflow-hidden rounded-2xl bg-gray-900 px-4 py-6 text-white shadow-lg md:px-6 md:py-8"
	>
		<!-- Current note display -->
		{#if stopwatchRune.note}
			<div class="mb-6 rounded-xl bg-gray-800/50 p-3 text-center">
				<span class="text-sm font-light text-blue-300">{stopwatchRune.note}</span>
			</div>
		{/if}

		<!-- Timer display -->
		<div class="mb-6 text-center md:mb-10">
			<div class="mb-6 text-6xl font-extralight tracking-tight tabular-nums md:mb-8 md:text-8xl">
				{stopwatchRune.formattedTime}
			</div>

			<!-- Note input field -->
			{#if !stopwatchRune.isRunning && showNoteInput}
				<div class="mb-6 flex items-center justify-center" in:fade={{ duration: 200 }}>
					<input
						type="text"
						bind:value={newNote}
						placeholder="Add a note for this timer"
						class="w-full rounded-lg border-0 bg-gray-800/70 px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
					/>
					<button
						onclick={toggleNoteInput}
						class="ml-2 rounded-lg bg-gray-800/50 px-3 py-3 text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-300"
					>
						Cancel
					</button>
				</div>
			{/if}

			<!-- Control buttons - smaller on mobile -->
			<div class="flex justify-center space-x-4 md:space-x-8">
				<button
					class="flex h-14 w-14 items-center justify-center rounded-full text-sm font-medium transition-all duration-200 ease-in-out focus:outline-none md:h-16 md:w-16 {!stopwatchRune.isRunning &&
					stopwatchRune.elapsedTime > 0
						? 'bg-gray-800 text-white hover:bg-gray-700'
						: 'cursor-not-allowed bg-gray-800/50 text-gray-500'}"
					disabled={stopwatchRune.isRunning || stopwatchRune.elapsedTime === 0}
					onclick={async () => {
						await stopwatchRune.resetTimer();
						// Don't load saved stopwatches after reset to avoid showing empty records
					}}
				>
					Reset
				</button>

				{#if !stopwatchRune.isRunning && stopwatchRune.elapsedTime === 0}
					<!-- Start button with note option -->
					<div class="flex flex-col items-center">
						<button
							class="flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-sm font-medium text-white shadow-lg transition-colors duration-200 ease-in-out hover:bg-green-700 focus:outline-none md:h-16 md:w-16"
							onclick={() => startTimer()}
						>
							Start
						</button>
						<button
							onclick={() => toggleNoteInput()}
							class="mt-2 text-xs text-blue-400 hover:text-blue-300"
						>
							{showNoteInput ? 'Hide Note' : 'Add Note'}
						</button>
					</div>
				{:else}
					<!-- Regular start/stop button -->
					<button
						class="flex h-14 w-14 items-center justify-center rounded-full text-sm font-medium shadow-lg transition-colors duration-200 ease-in-out focus:outline-none md:h-16 md:w-16 {stopwatchRune.isRunning
							? 'bg-red-600 text-white hover:bg-red-700'
							: 'bg-green-600 text-white hover:bg-green-700'}"
						onclick={async () => {
							await stopwatchRune.toggleTimer();
							if (!stopwatchRune.isRunning) {
								// Refresh list when stopping
								await loadSavedStopwatches();
							}
						}}
					>
						{stopwatchRune.isRunning ? 'Stop' : 'Start'}
					</button>
				{/if}

				<button
					class="flex h-14 w-14 items-center justify-center rounded-full text-sm font-medium transition-all duration-200 ease-in-out focus:outline-none md:h-16 md:w-16 {stopwatchRune.isRunning
						? 'bg-gray-800 text-white hover:bg-gray-700'
						: 'cursor-not-allowed bg-gray-800/50 text-gray-500'}"
					disabled={!stopwatchRune.isRunning}
					onclick={async () => {
						await stopwatchRune.recordLap();
					}}
				>
					Lap
				</button>
			</div>
		</div>

		<!-- Laps list - more compact on mobile -->
		{#if stopwatchRune.laps.length > 0}
			<div class="mt-4 border-t border-gray-800/60 pt-4 md:pt-6" in:fade={{ duration: 300 }}>
				<h3
					class="mb-2 text-center text-sm font-medium tracking-wider text-gray-400 uppercase md:mb-4"
				>
					Laps
				</h3>
				<div class="scrollbar-thin max-h-40 overflow-y-auto px-2 md:max-h-48">
					<table class="w-full">
						<thead>
							<tr
								class="border-b border-gray-800/40 text-xs tracking-wider text-gray-500 uppercase"
							>
								<th class="pb-2 text-left">Lap</th>
								<th class="pb-2 text-right">Split</th>
								<th class="pb-2 text-right">Lap Time</th>
							</tr>
						</thead>
						<tbody use:autoAnimate>
							{#each [...stopwatchRune.laps].reverse() as lap}
								<tr
									class="border-b border-gray-800/30 {stopwatchRune.fastestLap?.index === lap.index
										? 'text-green-400'
										: ''} {stopwatchRune.slowestLap?.index === lap.index ? 'text-gray-500' : ''}"
									in:fly={{ y: 5, duration: 150 }}
								>
									<td class="py-1 text-left text-sm md:py-2">{lap.index}</td>
									<td class="py-1 text-right font-light md:py-2"
										>{stopwatchRune.formatTime(lap.time)}</td
									>
									<td class="py-1 text-right font-light md:py-2"
										>{stopwatchRune.formatTime(lap.lapTime)}</td
									>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/if}
	</div>

	<!-- History section - always below stopwatch -->
	<div use:autoAnimate class="mt-6 w-full">
		<div class="mb-4 flex flex-wrap items-center justify-between">
			<div class="flex items-center">
				<h2 class="text-xl font-medium text-gray-200">History</h2>
				<span class="ml-2 text-sm text-gray-400">
					{isHistoryExpanded ? `Showing all` : `Showing last 5`}
				</span>
				<button
					onclick={toggleHistoryExpansion}
					class="ml-3 rounded-md bg-gray-800 p-1 text-sm text-gray-300 hover:bg-gray-700"
				>
					{isHistoryExpanded ? 'Collapse' : 'Show All'}
				</button>
			</div>

			<!-- Filter buttons - scrollable on mobile -->
			<div
				class="mt-2 flex w-full space-x-2 overflow-x-auto pb-2 whitespace-nowrap md:mt-0 md:w-auto"
			>
				<button
					class="flex-shrink-0 rounded-lg px-3 py-1 text-sm {selectedGroup === 'all'
						? 'bg-blue-600 text-white'
						: 'bg-gray-800 text-gray-300 hover:bg-gray-700'}"
					onclick={() => (selectedGroup = 'all')}
				>
					All
				</button>
				<div use:autoAnimate>
					{#each Object.keys(groupedStopwatches) as group}
						<button
							class="flex-shrink-0 rounded-lg px-3 py-1 text-sm {selectedGroup === group
								? 'bg-blue-600 text-white'
								: 'bg-gray-800 text-gray-300 hover:bg-gray-700'}"
							onclick={() => (selectedGroup = group)}
						>
							{group}
						</button>
					{/each}
				</div>
			</div>
		</div>

		{#if savedStopwatches.length === 0}
			<div class="flex h-32 items-center justify-center rounded-2xl bg-gray-900">
				<p class="text-gray-400">No saved stopwatches found</p>
			</div>
		{:else}
			<!-- Flat list of stopwatches, limited based on expansion state -->
			<div class="max-h-96 overflow-y-auto pr-1">
				<div use:autoAnimate class="space-y-2">
					{#each visibleStopwatches as stopwatch}
						<div
							class="group flex cursor-pointer items-center justify-between rounded-xl bg-gray-900 p-2 transition-colors duration-150 hover:bg-gray-800 md:p-3"
							onclick={() => loadStopwatch(stopwatch.id)}
							in:fade={{ duration: 150 }}
						>
							<div class="flex min-w-0 items-center">
								<div
									class="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-xs font-medium text-gray-400 group-hover:bg-gray-700 md:mr-4 md:h-10 md:w-10"
								>
									{stopwatch.laps?.length || 0}
								</div>
								<div class="min-w-0 truncate">
									<div class="text-sm font-medium text-white">
										{stopwatchRune.formatTime(stopwatch.elapsedTime || 0)}
									</div>
									{#if stopwatch.note}
										<div class="mt-0.5 max-w-[150px] truncate text-xs text-blue-400 md:max-w-none">
											{stopwatch.note}
										</div>
									{/if}
								</div>
							</div>
							<div class="flex items-center">
								<div class="mr-2 text-right text-xs text-gray-500 md:mr-4">
									<div>{formatDate(stopwatch.createdAt)}</div>
									<div>{formatFullDate(stopwatch.createdAt)}</div>
								</div>
								<button
									onclick={(e) => deleteStopwatch(stopwatch.id, e)}
									class="rounded p-2 text-gray-500 hover:bg-gray-700 hover:text-red-400"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-4 w-4"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
										/>
									</svg>
								</button>
							</div>
						</div>
					{/each}
				</div>

				<!-- "Show More" message when collapsed and there are more items -->
				{#if !isHistoryExpanded && savedStopwatches.length > 5}
					<div
						class="mt-3 cursor-pointer rounded-lg bg-gray-800/50 py-2 text-center transition-colors hover:bg-gray-800"
						onclick={toggleHistoryExpansion}
					>
						<p class="text-sm text-blue-400">
							Show {savedStopwatches.length - 5} more items
						</p>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	/* Hide scrollbars while maintaining scrolling functionality */
	.scrollbar-thin {
		scrollbar-width: none; /* Firefox */
		-ms-overflow-style: none; /* IE and Edge */
	}

	.scrollbar-thin::-webkit-scrollbar {
		display: none; /* Chrome, Safari and Opera */
	}

	/* Hide horizontal scrollbars */
	div {
		scrollbar-width: none; /* Firefox */
		-ms-overflow-style: none; /* IE and Edge */
	}

	div::-webkit-scrollbar {
		display: none; /* Chrome, Safari and Opera */
	}

	.tabular-nums {
		font-variant-numeric: tabular-nums;
	}
</style>
