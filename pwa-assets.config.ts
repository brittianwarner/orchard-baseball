import {
	createAppleSplashScreens,
	defineConfig,
	minimal2023Preset
} from '@vite-pwa/assets-generator/config';

export default defineConfig({
	// Use the minimal-2023 preset with customizations
	headLinkOptions: {
		preset: '2023'
	},
	preset: {
		...minimal2023Preset,
		appleSplashScreens: createAppleSplashScreens(
			{
				padding: 0,
				resizeOptions: { fit: 'cover', background: '#2a5c2f' },
				darkResizeOptions: { fit: 'contain', background: 'black' },
				linkMediaOptions: {
					log: true,
					addMediaScreen: true,
					xhtml: true
				}
			},
			[
				// iPhone models
				'iPhone 14 Pro Max',
				'iPhone 14 Pro',
				'iPhone 14 Plus',
				'iPhone 14',
				'iPhone 13 Pro Max',
				'iPhone 13 Pro',
				'iPhone 13',
				'iPhone 13 mini',
				'iPhone 12 Pro Max',
				'iPhone 12 Pro',
				'iPhone 12',
				'iPhone 12 mini',
				'iPhone 11 Pro Max',
				'iPhone 11 Pro',
				'iPhone 11',
				'iPhone XR',
				'iPhone XS Max',
				'iPhone XS',
				'iPhone X',
				'iPhone 8 Plus',
				'iPhone 8',
				// iPad models
				'iPad Pro 12.9"',
				'iPad Pro 11"',
				'iPad Pro 10.5"',
				'iPad Air 10.5"',
				'iPad Air 9.7"',
				'iPad 10.2"',
				'iPad mini 7.9"'
			]
		)
	},
	// The source image
	images: ['static/logo.png']
});
