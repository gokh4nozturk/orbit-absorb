import { resolve } from "node:path";
import { defineConfig } from "vite";

// Builds the demo/ playground into dist-demo/.
// GitHub Pages serves it under /orbit-absorb/, while Vercel serves it at the
// root, so the base path is chosen from the build environment.
export default defineConfig({
	root: resolve(__dirname, "demo"),
	base: process.env.VERCEL ? "/" : "/orbit-absorb/",
	build: {
		// Keep the output inside the Vite root (demo/) so the path is unambiguous
		// for Vercel — writing to ../dist-demo confused its post-build output lookup.
		outDir: resolve(__dirname, "dist-demo"),
		emptyOutDir: true,
	},
});
