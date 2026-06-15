import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const entry = (file: string) => fileURLToPath(new URL(file, import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        // 社内・候補者プロファイル管理
        main: entry("index.html"),
        // 公開・面談予約ページ（同一データ層を共有）
        booking: entry("booking.html"),
      },
    },
  },
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
