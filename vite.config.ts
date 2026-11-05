import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vitest/config";

export default defineConfig({
  base: "/english-word-rpg/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "영어 단어 RPG",
        short_name: "WordRPG",
        description: "단어 학습 RPG",
        theme_color: "#0f172a",
        background_color: "#0f172a",
        display: "standalone",
        icons: [],
      },
    }),
  ],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
  },
});
