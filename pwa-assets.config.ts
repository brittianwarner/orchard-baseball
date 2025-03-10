import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

export default defineConfig({
	// Use the minimal-2023 preset with customizations
	preset: {
		...minimal2023Preset,
		maskable: {
			...minimal2023Preset.maskable,
			resizeOptions: {
				background: '#2a5c2f', // Your green color
				fit: 'contain',
				position: 'center'
			}
		},
		apple: {
			...minimal2023Preset.apple,
			resizeOptions: {
				background: '#2a5c2f', // Your green color
				fit: 'contain',
				position: 'center'
			}
		}
	},
	// The source image
	images: ['static/logo.png']
});
