import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "node",
		globalSetup: ["./src/test/integration/globalSetup.ts"],
		include: ["src/test/integration/**/*.test.ts"],
		fileParallelism: false,
		testTimeout: 30_000,
		hookTimeout: 60_000,
	},
});
