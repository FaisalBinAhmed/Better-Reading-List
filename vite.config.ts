import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

export default defineConfig({
	plugins: [preact()],
	build: {
		target: "chrome120", // minimum supported Chrome version with reading list API
		rollupOptions: {
			input: {
				main: "./src/action.html",
				options: "./src/options/options.html",
				background: "./src/background/background.ts",
				contentScript: "./src/content-script/contentScript.ts"
			},
			output: {
				entryFileNames: `assets/[name].js`,
				chunkFileNames: `assets/[name].js`,
				assetFileNames: `assets/[name].[ext]`
			}
		}
	}
});
