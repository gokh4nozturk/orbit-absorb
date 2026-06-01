import { resolve } from "node:path";
import { defineConfig } from "vite";

// Builds the demo/ playground into dist-demo/.
// GitHub Pages serves it under /orbit-absorb/, while Vercel serves it at the
// root, so the base path is chosen from the build environment.
export default defineConfig({
	root: resolve(__dirname, "demo"),
	base: process.env.VERCEL ? "/" : "/orbit-absorb/",
	build: {
		outDir: resolve(__dirname, "dist-demo"),
		emptyOutDir: true,
	},
});
