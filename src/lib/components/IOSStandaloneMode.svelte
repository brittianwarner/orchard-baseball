<script lang="ts">
	import { onMount } from 'svelte';

	// State variables
	let isIOS = false;
	let isInStandaloneMode = false;

	// External link handler function
	function handleExternalLinks() {
		// Get all links in the document
		const links = document.querySelectorAll('a[href]');

		links.forEach((link) => {
			const href = link.getAttribute('href');
			const target = link.getAttribute('target');

			// Skip if it's not an external link or already has a target
			if (!href || href.startsWith('/') || href.startsWith('#') || target) {
				return;
			}

			// Check if it's an external link
			if (href.startsWith('http') && !href.includes(window.location.hostname)) {
				// Set target to _blank for external links
				link.setAttribute('target', '_blank');
				// Add rel attribute for security
				link.setAttribute('rel', 'noopener noreferrer');
			}
		});
	}

	onMount(() => {
		// Check if device is iOS
		isIOS =
			/iPad|iPhone|iPod/.test(navigator.userAgent) ||
			(navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

		// Check if app is in standalone mode (already installed as PWA)
		isInStandaloneMode =
			window.matchMedia('(display-mode: standalone)').matches ||
			('standalone' in window.navigator && (window.navigator as any).standalone);

		// Apply iOS standalone mode fixes only when needed
		if (isIOS && isInStandaloneMode) {
			// Fix for external links in standalone mode
			// iOS doesn't handle external links properly in standalone mode
			handleExternalLinks();

			// Add event listener to handle dynamically added links
			// This helps with links added via JavaScript or through navigation
			const observer = new MutationObserver((mutations) => {
				mutations.forEach((mutation) => {
					if (mutation.type === 'childList') {
						handleExternalLinks();
					}
				});
			});

			// Start observing the document for link changes
			observer.observe(document.body, {
				childList: true,
				subtree: true
			});

			// Add iOS standalone mode class to body
			document.body.classList.add('ios-standalone');
			document.documentElement.classList.add('ios-standalone');

			// Fix for iOS overscroll behavior while maintaining scrolling
			document.documentElement.style.setProperty('overscroll-behavior', 'none');
			document.body.style.setProperty('overscroll-behavior', 'none');

			// Directly apply the padding to body
			const safeAreaTop = 'env(safe-area-inset-top)';
			document.body.style.paddingTop = safeAreaTop;

			// Apply to additional container if needed
			const mainContainer = document.querySelector('[data-sveltekit-body]');
			if (mainContainer) {
				(mainContainer as HTMLElement).style.paddingTop = safeAreaTop;
			}

			// Handle back gesture
			window.addEventListener('popstate', () => {
				// If we're at the root of the app and user tries to go back
				if (document.referrer.indexOf(window.location.host) !== -1) {
					history.pushState(null, document.title, window.location.pathname);
				}
			});
		}
	});
</script>

<!-- Add iOS standalone mode styles -->
{#if isIOS && isInStandaloneMode}
	<style global>
		/* Critical: Ensure safe area padding for notch and status bar */
		:root {
			--safe-top: env(safe-area-inset-top);
		}

		/* Direct approach to handle notch area */
		body {
			/* !important to override any other styles */
			padding-top: env(safe-area-inset-top) !important;
			box-sizing: border-box;
		}

		/* Also apply to key elements to ensure coverage */
		body > div,
		[data-sveltekit-body],
		main,
		header,
		nav,
		.app-header,
		.navbar,
		.top-bar {
			padding-top: env(safe-area-inset-top) !important;
			box-sizing: border-box;
		}

		/* Fixed elements need special handling */
		.fixed-top,
		.sticky-top,
		div[style*='position: fixed'][style*='top'],
		div[style*='position:fixed'][style*='top'] {
			top: env(safe-area-inset-top) !important;
		}

		/* Ensure bottom elements respect safe area too */
		.fixed-bottom {
			bottom: env(safe-area-inset-bottom) !important;
		}

		/* Ensure scrolling works properly */
		html,
		body {
			width: 100%;
			height: 100%;
			overscroll-behavior: none;
			-webkit-overflow-scrolling: touch;
		}
	</style>
{/if}

<!-- Component doesn't render any visible elements, only applies fixes -->
