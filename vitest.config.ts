import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "node:path";

export default defineConfig({
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    plugins: [tsconfigPaths()],
    test: {
        root: ".",
        environment: "jsdom",
        globals: true,
        setupFiles: ["./tests/setup/vitest.setup.ts"],
        include: ["tests/**/*.{test,spec}.{ts,tsx}"],
        exclude: ["node_modules", "dist", ".next", "tests/e2e/**"],
        coverage: {
            provider: "v8",
            reporter: ["text", "html"],
            reportsDirectory: "./coverage",
        },
    },
});
