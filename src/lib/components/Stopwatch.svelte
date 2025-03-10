<script lang="ts">
	// Using Svelte 5 runes for state management
	import { fly, fade } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';

	// State variables using $state rune
	let isRunning = $state(false);
	let startTime = $state(0);
	let elapsedTime = $state(0);
	let laps = $state<{ index: number; time: number; lapTime: number }[]>([]);
	let timerInterval = $state<number | null>(null);
	let previousLapTime = $state(0);

	// Derived values using $derived rune
	let formattedTime = $derived(formatTime(elapsedTime));
	let fastestLap = $derived(getFastestLap(laps));
	let slowestLap = $derived(getSlowestLap(laps));

	// Effect to update timer when running
	$effect(() => {
		if (isRunning) {
			timerInterval = setInterval(() => {
				elapsedTime = Date.now() - startTime;
			}, 10) as unknown as number;
		} else if (timerInterval !== null) {
			clearInterval(timerInterval);
			timerInterval = null;
		}

		// Cleanup when component is destroyed
		return () => {
			if (timerInterval !== null) {
				clearInterval(timerInterval);
			}
		};
	});

	// Format time to display as MM:SS.mm
	function formatTime(timeInMs: number): string {
		const minutes = Math.floor(timeInMs / 60000);
		const seconds = Math.floor((timeInMs % 60000) / 1000);
		const milliseconds = Math.floor((timeInMs % 1000) / 10);

		return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
	}

	// Start/stop the timer
	function toggleTimer() {
		if (isRunning) {
			// Stop the timer
			isRunning = false;
		} else {
			// Start the timer
			if (elapsedTime === 0) {
				// First start
				startTime = Date.now();
			} else {
				// Resume from pause
				startTime = Date.now() - elapsedTime;
			}
			isRunning = true;
		}
	}

	// Record a lap time
	function recordLap() {
		if (!isRunning) return;

		const currentLapTime = elapsedTime - previousLapTime;
		laps = [
			...laps,
			{
				index: laps.length + 1,
				time: elapsedTime,
				lapTime: currentLapTime
			}
		];
		previousLapTime = elapsedTime;
	}

	// Reset the timer
	function resetTimer() {
		isRunning = false;
		elapsedTime = 0;
		startTime = 0;
		laps = [];
		previousLapTime = 0;
		if (timerInterval !== null) {
			clearInterval(timerInterval);
			timerInterval = null;
		}
	}

	// Get the fastest lap for highlighting
	function getFastestLap(lapsList: { index: number; time: number; lapTime: number }[]) {
		if (lapsList.length <= 1) return null;
		return lapsList.reduce(
			(fastest, current) => (current.lapTime < fastest.lapTime ? current : fastest),
			lapsList[1]
		);
	}

	// Get the slowest lap for highlighting
	function getSlowestLap(lapsList: { index: number; time: number; lapTime: number }[]) {
		if (lapsList.length <= 1) return null;
		return lapsList.reduce(
			(slowest, current) => (current.lapTime > slowest.lapTime ? current : slowest),
			lapsList[1]
		);
	}
</script>

<div class="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-8">
	<div
		class="w-full max-w-lg overflow-hidden rounded-3xl bg-gray-900 px-4 py-8 text-white shadow-xl"
	>
		<!-- Timer display -->
		<div class="mb-12 text-center">
			<div
				class="mb-8 text-7xl font-light tabular-nums"
				in:fly={{ y: -20, duration: 300, easing: cubicInOut }}
			>
				{formattedTime}
			</div>

			<!-- Control buttons -->
			<div class="flex justify-center space-x-8">
				<button
					class="flex h-20 w-20 items-center justify-center rounded-full text-sm font-semibold shadow-lg transition-all duration-200 ease-in-out focus:outline-none {!isRunning &&
					elapsedTime > 0
						? 'bg-slate-800 text-white'
						: 'bg-slate-700 text-slate-400'}"
					disabled={isRunning || elapsedTime === 0}
					onclick={resetTimer}
					title="Reset"
				>
					Reset
				</button>

				<button
					class="flex h-20 w-20 items-center justify-center rounded-full text-sm font-semibold shadow-lg transition-colors duration-200 ease-in-out focus:outline-none {isRunning
						? 'bg-gray-800 text-white hover:bg-red-900'
						: 'bg-gray-800 text-white hover:bg-green-900'}"
					onclick={toggleTimer}
					title={isRunning ? 'Stop' : 'Start'}
				>
					{isRunning ? 'Stop' : 'Start'}
				</button>

				<button
					class="flex h-20 w-20 items-center justify-center rounded-full text-sm font-semibold shadow-lg transition-all duration-200 ease-in-out focus:outline-none {isRunning
						? 'bg-slate-800 text-white'
						: 'bg-slate-700 text-slate-400'}"
					disabled={!isRunning}
					onclick={recordLap}
					title="Lap"
				>
					Lap
				</button>
			</div>
		</div>

		<!-- Laps list -->
		{#if laps.length > 0}
			<div class="mt-8 border-t border-gray-700 pt-4 text-white" in:fade={{ duration: 300 }}>
				<h3 class="mb-2 text-center text-lg font-medium">Laps</h3>
				<div class="scrollbar-thin max-h-60 overflow-y-auto px-2">
					<table class="w-full">
						<thead>
							<tr class="border-b border-gray-800 text-sm text-slate-400">
								<th class="py-2 text-left">Lap</th>
								<th class="py-2 text-right">Split Time</th>
								<th class="py-2 text-right">Lap Time</th>
							</tr>
						</thead>
						<tbody>
							{#each [...laps].reverse() as lap}
								<tr
									class="border-b border-gray-800 {fastestLap?.index === lap.index
										? 'text-green-500'
										: ''} {slowestLap?.index === lap.index ? 'text-gray-400' : ''}"
									in:fly={{ y: 10, duration: 200 }}
								>
									<td class="py-3 text-left">{lap.index}</td>
									<td class="py-3 text-right font-light">{formatTime(lap.time)}</td>
									<td class="py-3 text-right font-light">{formatTime(lap.lapTime)}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.scrollbar-thin::-webkit-scrollbar {
		width: 4px;
	}

	.scrollbar-thin::-webkit-scrollbar-track {
		background: #1a1a1a;
		border-radius: 4px;
	}

	.scrollbar-thin::-webkit-scrollbar-thumb {
		background: #444;
		border-radius: 4px;
	}

	.tabular-nums {
		font-variant-numeric: tabular-nums;
	}
</style>
