<script lang="ts">
	import '../app.css';
	import { page as pageState } from '$app/state';
	import LayoutRoot from '$lib/components/LayoutRoot.svelte';
	import { appRune } from '$lib/app.svelte';
	// @ts-ignore: virtual module from Vite PWA plugin
	import { pwaInfo } from 'virtual:pwa-info';

	let { children } = $props();

	$effect(() => {
		appRune.pagePath = pageState.url.pathname;
		appRune.section = pageState.url.pathname.split('/')[1] || '';
		appRune.subSection = pageState.url.pathname.split('/')[2] || '';
		appRune.page = pageState.url.pathname.split('/')[3] || '';
	});

	let webManifestLink = $state();

	$effect(() => {
		if (pwaInfo) {
			webManifestLink = pwaInfo.webManifest.linkTag;
		}
	});
</script>

<svelte:head>
	{@html webManifestLink}
</svelte:head>

<LayoutRoot>
	{@render children()}
</LayoutRoot>

{#await import('$lib/components/ReloadPrompt.svelte') then { default: ReloadPrompt }}
	<ReloadPrompt />
{/await}

{#await import('$lib/components/IOSPwaHelper.svelte') then { default: IOSPwaHelper }}
	<IOSPwaHelper />
{/await}

{#await import('$lib/components/IOSStandaloneMode.svelte') then { default: IOSStandaloneMode }}
	<IOSStandaloneMode />
{/await}
