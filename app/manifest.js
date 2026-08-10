export const dynamic = 'force-static';

export default function manifest() {
	return {
		name: 'FADConecta',
		short_name: 'FADConecta',
		icons: [
			{
				src: '/icons/android-chrome-192x192.png',
				sizes: '192x192',
				type: 'image/png',
			},
			{
				src: '/icons/android-chrome-512x512.png',
				sizes: '512x512',
				type: 'image/png',
			},
		],
		theme_color: '#f5f6f8',
		background_color: '#f5f6f8',
		display: 'standalone',
	};
}
