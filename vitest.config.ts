import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
  test: {
    environment: "node",
    // server/db.ts throws at import time if this is unset. MemStorage (what
    // these tests exercise) never actually queries the database, but it lives
    // in the same module as the Drizzle-backed storage classes, so the import
    // needs a syntactically valid placeholder to avoid crashing on load.
    env: {
      DATABASE_URL: "postgres://user:pass@localhost:5432/test_placeholder",
    },
  },
});
