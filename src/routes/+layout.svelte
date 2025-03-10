<script lang="ts">
	import '../app.css';
	import { page as pageState } from '$app/state';
	import LayoutRoot from '$lib/components/LayoutRoot.svelte';
	import { appRune } from '$lib/app.svelte';
	import { pwaInfo } from 'virtual:pwa-info';
	import { onMount } from 'svelte';

	let { children } = $props();

	$effect(() => {
		appRune.pagePath = pageState.url.pathname;
		appRune.section = pageState.url.pathname.split('/')[1] || '';
		appRune.subSection = pageState.url.pathname.split('/')[2] || '';
		appRune.page = pageState.url.pathname.split('/')[3] || '';
	});

	let webManifestLink = $state();

	onMount(async () => {
		if (pwaInfo) {
			const { registerSW } = await import('virtual:pwa-register');
			registerSW({
				immediate: true,
				onRegistered(r: ServiceWorkerRegistration) {
					// uncomment following code if you want check for updates
					// r && setInterval(() => {
					//    console.log('Checking for sw update')
					//    r.update()
					// }, 20000 /* 20s for testing purposes */)
					console.log(`SW Registered: ${r}`);
				},
				onRegisterError(error: Error) {
					console.log('SW registration error', error);
				}
			});
		}
	});

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
