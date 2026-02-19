import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
  },
  resolve: {
    alias: {
      "@blinkshare/common": path.resolve(__dirname, "packages/common/src"),
      "@": path.resolve(__dirname, "apps/web/src"),
    },
  },
});
