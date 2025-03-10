<script lang="ts">
	// Team roster data
	const roster = [
		{ name: 'Baumgardner, Fletcher', grade: 8 },
		{ name: 'Bekic, Linden', grade: 8 },
		{ name: 'Chugh, Satyam', grade: 8 },
		{ name: 'Crockett, Kingston', grade: 7 },
		{ name: 'Curry, Ashton', grade: 8 },
		{ name: 'Franzo, Drew', grade: 8 },
		{ name: 'Kuhnau, Oliver', grade: 6 },
		{ name: 'Mosby, Grady', grade: 7 },
		{ name: 'Potash, Evan', grade: 8 },
		{ name: 'Rothwell, Brooks', grade: 7 },
		{ name: 'Rothwell, Landon', grade: 7 },
		{ name: 'Smith, Keaton', grade: 7 },
		{ name: 'Trujillo, Mateo', grade: 7 },
		{ name: 'Van Valer, Graeme', grade: 7 }
	];
</script>

<div class="container mx-auto max-w-6xl px-4 py-8">
	<h1 class="mb-6 text-3xl font-bold text-gray-900">Team Roster</h1>
	<p class="mb-8 max-w-2xl text-gray-600">
		The Orchard Baseball team roster, featuring our talented players across different grade levels.
	</p>

	<!-- Roster Cards in Google Material Design Style -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
		{#each roster as player}
			<div class="overflow-hidden rounded-lg bg-white shadow transition-shadow hover:shadow-md">
				<div
					class="bg-primary-50 flex items-center justify-between border-b border-gray-100 px-4 py-2"
				>
					<span class="text-lg font-medium text-gray-800">{player.name.split(',')[0]}</span>
					<span class="bg-primary-100 text-primary-800 rounded-full px-2 py-1 text-xs font-medium">
						Grade {player.grade}
					</span>
				</div>
				<div class="px-4 py-3">
					<p class="text-sm text-gray-700">
						<span class="font-medium">First Name:</span>
						{player.name.split(',')[1].trim()}
					</p>
					<p class="mt-1 text-sm text-gray-700">
						<span class="font-medium">Last Name:</span>
						{player.name.split(',')[0]}
					</p>
					<div class="mt-3 flex justify-end">
						<div class="rounded-full bg-gray-100 p-1">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5 text-gray-500"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
								/>
							</svg>
						</div>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>
