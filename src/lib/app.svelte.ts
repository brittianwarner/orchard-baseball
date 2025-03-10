/*
	AppRune is for global state that is shared across the app.
*/
import { sections } from './content';

export interface Page {
	title: string;
	slug: string;
	description: string;
}

export interface SubSection {
	title: string;
	slug: string;
	description: string;
	pages: Page[];
}

export interface Section {
	title: string;
	slug: string;
	description: string;
	subsections: SubSection[];
}

export class AppRune {
	pagePath = $state('');
	section = $state('');
	subSection = $state('');
	page = $state('');
	content = $state<any>(null);
	metadata = $state<any>(null);
	loadError = $state<boolean>(false);
	isLoading = $state<boolean>(false);
	sections: Section[] = sections;
}

export class StopwatchRune {
	id = $state<string | null>(null);
	isRunning = $state(false);
	startTime = $state(0);
	elapsedTime = $state(0);
	laps = $state<{ index: number; time: number; lapTime: number }[]>([]);
	timerInterval = $state<number | null>(null);
	previousLapTime = $state(0);
	isSaving = $state(false);
	note = $state<string>('');

	constructor() {
		// Generate a unique ID for this stopwatch instance if not already set
		if (!this.id) {
			this.id = crypto.randomUUID();
		}
	}

	formatTime(timeInMs: number): string {
		const minutes = Math.floor(timeInMs / 60000);
		const seconds = Math.floor((timeInMs % 60000) / 1000);
		const milliseconds = Math.floor((timeInMs % 1000) / 10);

		return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
	}

	// Start/stop the timer
	async toggleTimer(note?: string) {
		if (this.isRunning) {
			// Stop the timer
			this.isRunning = false;
			// Save the stopwatch state when stopping
			await this.saveToKV();
		} else {
			// Start the timer
			if (this.elapsedTime === 0) {
				// First start
				this.startTime = Date.now();

				// Set note if provided
				if (note) {
					this.note = note;
				}
			} else {
				// Resume from pause
				this.startTime = Date.now() - this.elapsedTime;
			}
			this.isRunning = true;
		}
	}

	// Record a lap time
	async recordLap() {
		if (!this.isRunning) return;

		const currentLapTime = this.elapsedTime - this.previousLapTime;
		this.laps = [
			...this.laps,
			{
				index: this.laps.length + 1,
				time: this.elapsedTime,
				lapTime: currentLapTime
			}
		];
		this.previousLapTime = this.elapsedTime;

		// Save state after recording a lap
		await this.saveToKV();
	}

	// Reset the timer
	async resetTimer() {
		this.isRunning = false;
		this.elapsedTime = 0;
		this.startTime = 0;
		this.laps = [];
		this.previousLapTime = 0;
		this.note = '';
		if (this.timerInterval !== null) {
			clearInterval(this.timerInterval);
			this.timerInterval = null;
		}

		// Generate a new ID for the next run
		this.id = crypto.randomUUID();

		// Don't save empty records to KV storage
		// await this.saveToKV(); - removed to prevent saving empty records
	}

	// Save the current state to KV Redis
	async saveToKV() {
		if (this.isSaving) return;

		try {
			this.isSaving = true;

			const stopwatchData = {
				id: this.id,
				startTime: this.startTime,
				elapsedTime: this.elapsedTime,
				isRunning: this.isRunning,
				laps: this.laps, // API will stringify this for hash storage
				previousLapTime: this.previousLapTime,
				note: this.note,
				createdAt: Date.now()
			};

			// Save to general endpoint
			await fetch('/api/stopwatch', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(stopwatchData)
			});

			// Save to specific stopwatch endpoint
			if (this.id) {
				await fetch(`/api/stopwatch/${this.id}`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(stopwatchData)
				});
			}
		} catch (error) {
			console.error('Failed to save stopwatch data:', error);
		} finally {
			this.isSaving = false;
		}
	}

	// Load a specific stopwatch from KV Redis
	async loadFromKV(id: string) {
		try {
			const response = await fetch(`/api/stopwatch?id=${id}`);
			if (response.ok) {
				const data = await response.json();
				if (data) {
					this.id = id;
					this.startTime = parseInt(data.startTime) || 0;
					this.elapsedTime = parseInt(data.elapsedTime) || 0;
					this.isRunning = data.isRunning === 'true'; // Convert string to boolean
					this.note = data.note || '';

					// Handle laps - parse JSON string if needed
					if (data.laps) {
						try {
							// If laps is stored as a JSON string, parse it
							this.laps = typeof data.laps === 'string' ? JSON.parse(data.laps) : data.laps;
						} catch (e) {
							console.error('Error parsing laps data:', e);
							this.laps = [];
						}
					} else {
						this.laps = [];
					}

					this.previousLapTime = parseInt(data.previousLapTime) || 0;
				}
			}
		} catch (error) {
			console.error('Failed to load stopwatch data:', error);
		}
	}

	// Get list of saved stopwatches
	async getSavedStopwatches() {
		try {
			const response = await fetch('/api/stopwatch');
			if (response.ok) {
				return await response.json();
			}
			return [];
		} catch (error) {
			console.error('Failed to load stopwatch list:', error);
			return [];
		}
	}

	// Get the fastest lap for highlighting
	getFastestLap(lapsList: { index: number; time: number; lapTime: number }[]) {
		if (lapsList.length <= 1) return null;
		return lapsList.reduce(
			(fastest, current) => (current.lapTime < fastest.lapTime ? current : fastest),
			lapsList[1]
		);
	}

	// Get the slowest lap for highlighting
	getSlowestLap(lapsList: { index: number; time: number; lapTime: number }[]) {
		if (lapsList.length <= 1) return null;
		return lapsList.reduce(
			(slowest, current) => (current.lapTime > slowest.lapTime ? current : slowest),
			lapsList[1]
		);
	}

	// Derived values using $derived rune
	formattedTime = $derived(this.formatTime(this.elapsedTime));
	fastestLap = $derived(this.getFastestLap(this.laps));
	slowestLap = $derived(this.getSlowestLap(this.laps));
}

export const appRune = new AppRune();
export const stopwatchRune = new StopwatchRune();
