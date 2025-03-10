<script lang="ts">
	// Using Svelte 5 runes for state management
	import { fly, fade } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';
	import { stopwatchRune } from '$lib/app.svelte';

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

	// Format time to display as MM:SS.mm
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
				{stopwatchRune.formattedTime}
			</div>

			<!-- Control buttons -->
			<div class="flex justify-center space-x-8">
				<button
					class="flex h-20 w-20 items-center justify-center rounded-full text-sm font-semibold shadow-lg transition-all duration-200 ease-in-out focus:outline-none {!stopwatchRune.isRunning &&
					stopwatchRune.elapsedTime > 0
						? 'bg-slate-800 text-white'
						: 'bg-slate-700 text-slate-400'}"
					disabled={stopwatchRune.isRunning || stopwatchRune.elapsedTime === 0}
					onclick={() => {
						console.log('resetTimer');
						stopwatchRune.resetTimer();
					}}
					title="Reset"
				>
					Reset
				</button>

				<button
					class="flex h-20 w-20 items-center justify-center rounded-full text-sm font-semibold shadow-lg transition-colors duration-200 ease-in-out focus:outline-none {stopwatchRune.isRunning
						? 'bg-gray-800 text-white hover:bg-red-900'
						: 'bg-gray-800 text-white hover:bg-green-900'}"
					onclick={() => {
						console.log('toggleTimer');
						stopwatchRune.toggleTimer();
					}}
					title={stopwatchRune.isRunning ? 'Stop' : 'Start'}
				>
					{stopwatchRune.isRunning ? 'Stop' : 'Start'}
				</button>

				<button
					class="flex h-20 w-20 items-center justify-center rounded-full text-sm font-semibold shadow-lg transition-all duration-200 ease-in-out focus:outline-none {stopwatchRune.isRunning
						? 'bg-slate-800 text-white'
						: 'bg-slate-700 text-slate-400'}"
					disabled={!stopwatchRune.isRunning}
					onclick={() => {
						console.log('recordLap');
						stopwatchRune.recordLap();
					}}
					title="Lap"
				>
					Lap
				</button>
			</div>
		</div>

		<!-- Laps list -->
		{#if stopwatchRune.laps.length > 0}
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
							{#each [...stopwatchRune.laps].reverse() as lap}
								<tr
									class="border-b border-gray-800 {stopwatchRune.fastestLap?.index === lap.index
										? 'text-green-500'
										: ''} {stopwatchRune.slowestLap?.index === lap.index ? 'text-gray-400' : ''}"
									in:fly={{ y: 10, duration: 200 }}
								>
									<td class="py-3 text-left">{lap.index}</td>
									<td class="py-3 text-right font-light">{stopwatchRune.formatTime(lap.time)}</td>
									<td class="py-3 text-right font-light">{stopwatchRune.formatTime(lap.lapTime)}</td
									>
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
