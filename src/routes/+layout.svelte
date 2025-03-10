<script lang="ts">
	import '../app.css';
	import { page as pageState } from '$app/state';
	import LayoutRoot from '$lib/components/LayoutRoot.svelte';
	import { appRune } from '$lib/app.svelte';
	import { pwaAssetsHead } from 'virtual:pwa-assets/head';

	let { children } = $props();

	$effect(() => {
		appRune.pagePath = pageState.url.pathname;
		appRune.section = pageState.url.pathname.split('/')[1] || '';
		appRune.subSection = pageState.url.pathname.split('/')[2] || '';
		appRune.page = pageState.url.pathname.split('/')[3] || '';
	});
</script>

<svelte:head>
	{#if pwaAssetsHead.themeColor}
		<meta name="theme-color" content={pwaAssetsHead.themeColor.content} />
	{/if}
	{#each pwaAssetsHead.links as link}
		<link {...link} />
	{/each}
</svelte:head>

<LayoutRoot>
	{@render children()}
</LayoutRoot>
