import { resolve } from "node:path";
import { defineConfig } from "vite";

// Builds the demo/ playground into dist-demo/ for GitHub Pages.
export default defineConfig({
	root: resolve(__dirname, "demo"),
	base: "/orbit-absorb/",
	build: {
		outDir: resolve(__dirname, "dist-demo"),
		emptyOutDir: true,
	},
});
