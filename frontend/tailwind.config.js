/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
	  "./src/**/*.{js,jsx,ts,tsx}",
	],
	theme: {
	  extend: {
		colors: {
		  'mPrimary': '#431C4C',
		  'mSecondary': '#C887CB',
		  'mTertiary': '#F6ECF7',
		  'mQuaternary': '#FBF7FD',
		},
		fontFamily: {
		  'poppins': ['Poppins']
		}
	  },
	},
	plugins: [
		require('tailwindcss'),
		require('autoprefixer'),
	],
}