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

export const appRune = new AppRune();
