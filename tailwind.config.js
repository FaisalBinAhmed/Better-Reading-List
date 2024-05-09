/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./src/action.html",
		"./src/options/options.html",
		"./src/**/*.tsx" // .{ext, tsx} pattern does not work, specify the file extension
	],
	theme: {
		extend: {}
	},
	plugins: []
};
