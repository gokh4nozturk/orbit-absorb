import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, "src/index.ts"),
			name: "OrbitAbsorb",
			fileName: format => (format === "es" ? "orbit-absorb.js" : "orbit-absorb.umd.cjs"),
			formats: ["es", "umd"],
		},
		sourcemap: true,
	},
});
