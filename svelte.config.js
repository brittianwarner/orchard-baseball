import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-vercel';
import { sveltePreprocess } from 'svelte-preprocess';
import rehypeExternalLinks from 'rehype-external-links';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: [
		sveltePreprocess(),
		mdsvex({
			extensions: ['.md', '.svx'],
			layout: {
				_: './src/lib/layouts/Default.svelte'
			},
			smartypants: true,
			rehypePlugins: [rehypeExternalLinks]
		})
	],
	kit: {
		adapter: adapter({
			runtime: 'nodejs22.x',
			isr: {
				expiration: false
			},
			external: [
				'path',
				'crypto',
				'fs',
				'events',
				'util',
				'url',
				'stream',
				'mock-aws-s3',
				'os',
				'aws-sdk',
				'nock',
				'assert',
				'path',
				'child_process',
				'node-fetch'
			]
		}),
		inlineStyleThreshold: 2048,
		serviceWorker: {
			register: false
		},
		output: {
			preloadStrategy: 'preload-js'
		},
		csrf: {
			checkOrigin: process.env.NODE_ENV !== 'development'
		}
	},

	extensions: ['.svelte', '.md', '.svx']
};

export default config;
