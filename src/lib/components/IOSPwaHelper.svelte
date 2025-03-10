<script lang="ts">
	import { onMount } from 'svelte';

	// State variables
	let isIOS = false;
	let isInStandaloneMode = false;
	let showInstallPrompt = false;
	let isIOSSafari = false;

	onMount(() => {
		// Check if device is iOS
		isIOS =
			/iPad|iPhone|iPod/.test(navigator.userAgent) ||
			(navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

		// Check if app is in standalone mode (already installed as PWA)
		isInStandaloneMode =
			window.matchMedia('(display-mode: standalone)').matches ||
			('standalone' in window.navigator && (window.navigator as any).standalone);

		// Check if browser is Safari on iOS (the only browser that supports PWA installation on iOS)
		isIOSSafari =
			isIOS && /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

		// Show installation prompt only for iOS Safari and not already in standalone mode
		showInstallPrompt = isIOS && isIOSSafari && !isInStandaloneMode;
	});

	// Function to dismiss the install prompt
	function dismissPrompt() {
		showInstallPrompt = false;
		// Store in localStorage to avoid showing the prompt too frequently
		localStorage.setItem('pwaDismissed', Date.now().toString());
	}
</script>

{#if showInstallPrompt}
	<div class="ios-pwa-prompt">
		<div class="prompt-content">
			<button class="close-button" on:click={dismissPrompt} aria-label="Close">×</button>
			<h3>Install Orchard Baseball</h3>
			<p>Install this app on your home screen for the best experience:</p>
			<ol class="install-steps">
				<li>
					Tap the <strong>Share</strong> icon <span class="share-icon">⎙</span> in the browser toolbar
				</li>
				<li>Scroll down and tap <strong>Add to Home Screen</strong></li>
				<li>Tap <strong>Add</strong> in the confirmation dialog</li>
			</ol>
		</div>
	</div>
{/if}

{#if isIOS && !isIOSSafari && !isInStandaloneMode}
	<div class="ios-safari-prompt">
		<p>For the best experience, please open this page in Safari to install as an app.</p>
		<button on:click={() => dismissPrompt()}>Got it</button>
	</div>
{/if}

<style>
	.ios-pwa-prompt {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background-color: #fff;
		padding: 16px;
		box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
		z-index: 1000;
		border-top-left-radius: 12px;
		border-top-right-radius: 12px;
		animation: slideUp 0.3s ease-out;
	}

	@keyframes slideUp {
		from {
			transform: translateY(100%);
		}
		to {
			transform: translateY(0);
		}
	}

	.prompt-content {
		position: relative;
		max-width: 500px;
		margin: 0 auto;
	}

	.close-button {
		position: absolute;
		right: 0;
		top: 0;
		background: none;
		border: none;
		font-size: 24px;
		cursor: pointer;
		padding: 0;
		margin: 0;
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	h3 {
		margin-top: 0;
		margin-bottom: 12px;
		font-size: 18px;
		font-weight: 600;
	}

	.install-steps {
		margin-left: 20px;
		padding-left: 0;
	}

	.install-steps li {
		margin-bottom: 8px;
	}

	.share-icon {
		display: inline-block;
		font-size: 20px;
	}

	.ios-safari-prompt {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		background-color: #ffebb3;
		padding: 10px 16px;
		text-align: center;
		z-index: 1000;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.ios-safari-prompt button {
		background-color: #2a5c2f;
		color: white;
		border: none;
		padding: 5px 10px;
		border-radius: 4px;
		cursor: pointer;
	}

	.ios-safari-prompt p {
		margin: 0;
	}

	@media (display-mode: standalone) {
		.ios-pwa-prompt,
		.ios-safari-prompt {
			display: none;
		}
	}
</style>
