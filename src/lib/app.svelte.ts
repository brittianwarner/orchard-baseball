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
	isRunning = $state(false);
	startTime = $state(0);
	elapsedTime = $state(0);
	laps = $state<{ index: number; time: number; lapTime: number }[]>([]);
	timerInterval = $state<number | null>(null);
	previousLapTime = $state(0);

	formatTime(timeInMs: number): string {
		const minutes = Math.floor(timeInMs / 60000);
		const seconds = Math.floor((timeInMs % 60000) / 1000);
		const milliseconds = Math.floor((timeInMs % 1000) / 10);

		return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
	}

	// Start/stop the timer
	toggleTimer() {
		if (this.isRunning) {
			// Stop the timer
			this.isRunning = false;
		} else {
			// Start the timer
			if (this.elapsedTime === 0) {
				// First start
				this.startTime = Date.now();
			} else {
				// Resume from pause
				this.startTime = Date.now() - this.elapsedTime;
			}
			this.isRunning = true;
		}
	}

	// Record a lap time
	recordLap() {
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
	}

	// Reset the timer
	resetTimer() {
		this.isRunning = false;
		this.elapsedTime = 0;
		this.startTime = 0;
		this.laps = [];
		this.previousLapTime = 0;
		if (this.timerInterval !== null) {
			clearInterval(this.timerInterval);
			this.timerInterval = null;
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
