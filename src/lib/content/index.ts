import type { Section } from '../app.svelte';

export interface Post {
	slug: string;
	title: string;
	description?: string;
	published?: boolean;
	publishedDate?: string;
	section?: string;
	subsection?: string;
	// Add other metadata fields as needed
}

export interface PageData {
	content?: any;
	meta?: Record<string, any>;
	section?: string;
	subsection?: string;
	sections?: Section[];
	posts?: Post[];
	sectionData?: Section;
	subsectionData?: any;
}

/**
 * Main content retrieval function that handles all page types
 * @param path The path to get content for (e.g., "", "section", "section/subsection", "section/subsection/page")
 * @returns Content data for the requested path
 */
export async function getPage(path: string = ''): Promise<PageData> {
	// Parse the path into parts
	const pathParts = path ? path.split('/') : [];

	// Handle different path scenarios based on the number of path parts
	if (path === '' || !pathParts.length) {
		// Home page - return table of contents (all sections)
		return { sections };
	}

	if (pathParts.length === 1) {
		// Section page
		const sectionSlug = pathParts[0];
		const sectionData = sections.find((s) => s.slug === sectionSlug);

		if (!sectionData) {
			throw new Error(`Section "${sectionSlug}" not found`);
		}

		return {
			section: sectionSlug,
			sectionData
		};
	}

	if (pathParts.length === 2) {
		// Section/Subsection page
		const [sectionSlug, subsectionSlug] = pathParts;

		// Find the section
		const sectionData = sections.find((s) => s.slug === sectionSlug);
		if (!sectionData) {
			throw new Error(`Section "${sectionSlug}" not found`);
		}

		// Find the subsection
		const subsectionData = sectionData.subsections.find((s) => s.slug === subsectionSlug);
		if (!subsectionData) {
			throw new Error(`Subsection "${subsectionSlug}" not found in section "${sectionSlug}"`);
		}

		// Get all posts for this subsection
		const posts = await getSubsectionPosts(sectionSlug, subsectionSlug);

		return {
			section: sectionSlug,
			subsection: subsectionSlug,
			sectionData,
			subsectionData,
			posts
		};
	}

	if (pathParts.length === 3) {
		// Full content page (section/subsection/page)
		const [sectionSlug, subsectionSlug, pageSlug] = pathParts;

		try {
			// Dynamically import the page content
			const module = await import(`../content/${sectionSlug}/${subsectionSlug}/${pageSlug}.md`);

			return {
				content: module.default,
				meta: {
					...module.metadata,
					title: module.metadata?.title || pageSlug,
					slug: pageSlug
				},
				section: sectionSlug,
				subsection: subsectionSlug
			};
		} catch (error) {
			console.error(`Error loading page: ${path}`, error);
			throw new Error(`Page not found: ${path}`);
		}
	}

	// Invalid path
	throw new Error(`Invalid path format: ${path}`);
}

/**
 * Helper function to get all posts within a subsection
 * @param sectionSlug The section slug
 * @param subsectionSlug The subsection slug
 * @returns Array of posts in the subsection
 */
async function getSubsectionPosts(sectionSlug: string, subsectionSlug: string): Promise<Post[]> {
	const items: Post[] = [];

	// Get all markdown files in the content directory
	const modules = import.meta.glob('../content/**/*.md', { eager: true });

	// Filter and process matching files
	for (const path in modules) {
		// Extract path components
		const pathParts = path.split('/');
		const fileName = pathParts.at(-1);
		if (!fileName) continue;

		const currentSection = pathParts.at(-3);
		const currentSubsection = pathParts.at(-2);

		// Skip if it doesn't match our section/subsection
		if (currentSection !== sectionSlug || currentSubsection !== subsectionSlug) continue;

		// Extract page slug and get the module
		const pageSlug = fileName.replace('.md', '');
		const module = modules[path];

		// Process if module has metadata
		if (module && typeof module === 'object' && 'metadata' in module && module.metadata) {
			const metadata = module.metadata as Record<string, any>;

			// Skip unpublished content if the published flag exists and is false
			if ('published' in metadata && metadata.published === false) continue;

			// Create a post object
			const post = {
				...metadata,
				slug: pageSlug,
				section: currentSection,
				subsection: currentSubsection,
				title: metadata.title || pageSlug
			} satisfies Post;

			items.push(post);
		}
	}

	// Sort by published date if available
	return items.sort((a, b) => {
		if (a.publishedDate && b.publishedDate) {
			return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
		}
		return 0;
	});
}

export const sections: Section[] = [
	{
		title: 'Dynamic Warmup',
		slug: 'dynamic-warmup',
		description: 'Comprehensive 15-minute warmup routine for baseball practices and games',
		subsections: [
			{
				title: 'Getting Started',
				slug: 'getting-started',
				description: 'Starting exercises to increase heart rate and prepare the body',
				pages: [
					{
						title: 'Overview',
						slug: 'overview',
						description: 'Introduction to the 15-minute dynamic warmup routine'
					},
					{
						title: 'Jog the Warning Track',
						slug: 'jog-warning-track',
						description: 'Light jogging to raise body temperature'
					},
					{
						title: 'Line Formation',
						slug: 'line-formation',
						description: 'Organizing in columns for efficient execution'
					}
				]
			},
			{
				title: 'Upper Body',
				slug: 'upper-body',
				description: 'Arm and shoulder mobility exercises',
				pages: [
					{
						title: 'Forearm Stretches',
						slug: 'forearm-stretches',
						description: 'Stretching the forearms and wrists'
					},
					{
						title: 'Arm Circles',
						slug: 'arm-circles',
						description: 'Progressive circular movements for shoulder mobility'
					},
					{
						title: 'Arms Across Chest',
						slug: 'arms-across-chest',
						description: 'Posterior shoulder stretches'
					},
					{
						title: 'Arms Behind Head',
						slug: 'arms-behind-head',
						description: 'Triceps and shoulder mobility'
					},
					{
						title: 'Torso Rotations',
						slug: 'torso-rotations',
						description: 'Core activation through controlled twisting'
					}
				]
			},
			{
				title: 'Band Work',
				slug: 'band-work',
				description: 'Resistance exercises for shoulder health and stability',
				pages: [
					{
						title: 'Overhead Butterfly',
						slug: 'overhead-butterfly',
						description: 'Front to back butterfly movements with resistance band'
					},
					{
						title: 'X Movements',
						slug: 'x-movements',
						description: 'Drawing an X pattern with resistance band'
					},
					{
						title: 'Waist Butterfly',
						slug: 'waist-butterfly',
						description: 'Butterfly motions at waist level with palm variations'
					},
					{
						title: 'Statue of Liberty',
						slug: 'statue-of-liberty',
						description: 'Overhead throwing arm exercise with resistance'
					}
				]
			},
			{
				title: 'Lower Body Mobility',
				slug: 'lower-body',
				description: "Dynamic stretches from foul line to pitcher's mound",
				pages: [
					{
						title: 'Knee Hugs',
						slug: 'knee-hugs',
						description: 'Hip mobility through walking knee pulls'
					},
					{
						title: 'Walking Quad Reach',
						slug: 'walking-quad-reach',
						description: 'Quadriceps stretch with opposite hand reaching skyward'
					},
					{
						title: 'Walking Kick and RDL',
						slug: 'walking-kick-rdl',
						description: 'Forward kicks and Romanian deadlifts for hamstring mobility'
					},
					{
						title: 'Gate Exercises',
						slug: 'gate-exercises',
						description: 'Opening and closing hip gates for rotational mobility'
					},
					{
						title: 'Lunges',
						slug: 'lunges',
						description: 'Forward and side lunges for lower body preparation'
					},
					{
						title: 'Slide Step Lunges',
						slug: 'slide-step-lunges',
						description: 'Lateral movements with lunges'
					}
				]
			},
			{
				title: 'Speed and Agility',
				slug: 'speed-agility',
				description: 'Progressive running drills to prepare for game intensity',
				pages: [
					{
						title: 'Side Shuffle',
						slug: 'side-shuffle',
						description: 'Lateral movement in athletic position'
					},
					{
						title: 'High Knee Karaoke',
						slug: 'high-knee-karaoke',
						description: 'Lateral crossover steps with high knees'
					},
					{
						title: 'High Knees',
						slug: 'high-knees',
						description: 'Forward running with exaggerated knee lift'
					},
					{
						title: 'Butt Kicks',
						slug: 'butt-kicks',
						description: 'Running with heels kicking toward glutes'
					},
					{
						title: 'Explosive Skips',
						slug: 'explosive-skips',
						description: 'Forward and backward skipping with height and power'
					}
				]
			},
			{
				title: 'Baseball-Specific Running',
				slug: 'baseball-running',
				description: 'Game situation running progressions',
				pages: [
					{
						title: 'Progressive Speed Runs',
						slug: 'progressive-speed',
						description: 'Gradually increasing running intensity'
					},
					{
						title: 'Game Situation Running',
						slug: 'game-situations',
						description: 'Baseball-specific movement patterns and techniques'
					}
				]
			}
		]
	},
	{
		title: 'Throwing Progression',
		slug: 'throwing-progression',
		description: 'Comprehensive throwing progression routine for baseball practices and games',
		subsections: [
			{
				title: 'Getting Started',
				slug: 'getting-started',
				description: 'Preparation steps before beginning the throwing progression',
				pages: [
					{
						title: 'Safety',
						slug: 'safety',
						description: 'Important safety considerations before starting'
					},
					{
						title: 'Partner Up',
						slug: 'partner-up',
						description: 'Finding and working with a throwing partner'
					}
				]
			},
			{
				title: 'On Two Knees',
				slug: 'two-knees',
				description: 'Beginning throws from a stable two-knee position',
				pages: [
					{
						title: 'Elbow on Glove Flip',
						slug: 'elbow-glove-flip',
						description: 'Short-distance wrist action throws (5 feet, 60 seconds)'
					},
					{
						title: 'Short Hops Underhanded',
						slug: 'short-hops-underhanded',
						description:
							'Practice fielding short hops from an underhand position (5-10 feet, 60 seconds)'
					},
					{
						title: 'Two-Knee Throw and Fall',
						slug: 'throw-and-fall',
						description: 'Medium-distance throws with forward fall (15-20 feet, 60 seconds)'
					},
					{
						title: 'Short Hops Soft Throw',
						slug: 'short-hops-soft-throw',
						description:
							'Practice fielding short hops with soft overhand throws (15-20 feet, 60 seconds)'
					}
				]
			},
			{
				title: 'On One Knee',
				slug: 'one-knee',
				description: 'Progressing to one-knee throwing position',
				pages: [
					{
						title: 'Exaggerated Full Throw',
						slug: 'knee-down',
						description:
							'Exaggerated throwing motion with chest to knee finish (15-20 feet, 60 seconds)'
					},
					{
						title: 'Short Hops on One Knee',
						slug: 'short-hops-one-knee',
						description:
							'Practice fielding short hops from the one-knee position (15-20 feet, 60 seconds)'
					}
				]
			},
			{
				title: 'Standing Throws',
				slug: 'standing-throws',
				description: 'Progressive distance throwing from standing position',
				pages: [
					{
						title: 'Figure Eight Throwing',
						slug: 'figure-eight',
						description: 'Feet stationary figure eight arm motion (30 feet, 60 seconds)'
					},
					{
						title: 'Normal Throw 30 Feet',
						slug: 'normal-30',
						description: 'Standard throwing mechanics at 30 feet (60 seconds)'
					},
					{
						title: 'Normal Throw 45 Feet',
						slug: 'normal-45',
						description: 'Standard throwing mechanics at 45 feet (60 seconds)'
					},
					{
						title: 'Normal Throw 60 Feet',
						slug: 'normal-60',
						description: 'Standard throwing mechanics at 60 feet (60 seconds)'
					},
					{
						title: 'Normal Throw 90 Feet',
						slug: 'normal-90',
						description: 'Standard throwing mechanics at 90 feet (60 seconds)'
					},
					{
						title: 'Normal Throw 120 Feet',
						slug: 'normal-120',
						description: 'Standard throwing mechanics at 120 feet (60 seconds)'
					}
				]
			},
			{
				title: 'Finishing Sequence',
				slug: 'finishing',
				description: 'Final stages of the throwing progression',
				pages: [
					{
						title: 'Easy Semi-Long Toss',
						slug: 'semi-long-toss',
						description: 'High arc throws at comfortable maximum distance'
					},
					{
						title: 'Coming Back In',
						slug: 'coming-in',
						description: 'Gradual reduction in distance back to 60 feet'
					},
					{
						title: 'Quick Hands Quick Feet',
						slug: 'quick-hands-feet',
						description: 'Rapid transfer drill for game situations (60 seconds)'
					}
				]
			}
		]
	}
	// {
	// 	title: 'Coaching Resources',
	// 	slug: 'coaching-resources',
	// 	description: 'Resources and comprehensive guides for baseball coaches',
	// 	subsections: [
	// 		{
	// 			title: 'Complete Dynamic Warmup Routine',
	// 			slug: 'complete-routine',
	// 			description: 'The full 15-minute dynamic warmup sequence',
	// 			pages: [
	// 				{
	// 					title: 'Complete Routine',
	// 					slug: 'complete-routine',
	// 					description: 'The full 15-minute dynamic warmup sequence'
	// 				}
	// 			]
	// 		}
	// 	]
	// }
];

/**
 * Get all sections or a specific section
 * @param sectionSlug Optional slug to get a specific section
 * @returns All sections or a specific section if found
 */
export function getSections(sectionSlug?: string): Section[] | Section | null {
	if (!sectionSlug) {
		return sections;
	}

	const section = sections.find((s) => s.slug === sectionSlug);
	return section || null;
}

/**
 * Get a specific subsection from a section
 * @param sectionSlug The section slug
 * @param subsectionSlug The subsection slug
 * @returns The subsection if found, null otherwise
 */
export function getSubsection(sectionSlug: string, subsectionSlug: string) {
	const section = sections.find((s) => s.slug === sectionSlug);
	if (!section) return null;

	const subsection = section.subsections.find((s) => s.slug === subsectionSlug);
	return subsection || null;
}
