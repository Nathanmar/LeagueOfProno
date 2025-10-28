/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./index.html',
		'./app/**/*.{js,ts,jsx,tsx}',
		'./app/components/**/*.{js,ts,jsx,tsx}',
		'./app/routes/**/*.{js,ts,jsx,tsx}',
		'./app/routes.ts',
		'./app/root.tsx',
	],
	theme: {
		extend: {
			colors: {
				background: '#FAF9F6',
				foreground: '#000000',
				primary: '#548CB4',
				'primary-hover': '#4a7ca0',
				secondary: '#C4A15B',
				muted: '#F5F4F1',
				border: '#E5E4E1',
			},
			borderRadius: {
				DEFAULT: '0.25rem',
			},
			fontFamily: {
				sans: [
					'Inter',
					'-apple-system',
					'BlinkMacSystemFont',
					'Segoe UI',
					'Roboto',
					'Oxygen',
					'Ubuntu',
					'Cantarell',
					'sans-serif',
				],
			},
		},
	},
	plugins: [],
};
