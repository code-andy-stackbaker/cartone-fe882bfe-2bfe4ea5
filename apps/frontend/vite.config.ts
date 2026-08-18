import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  // Local dev only. In production the built SPA is served by `serve -s dist -l $PORT`.
  server: { port: 5000, host: true },
  preview: { port: 5000, host: true },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.tsx", "src/**/*.test.ts"]
  }
});
