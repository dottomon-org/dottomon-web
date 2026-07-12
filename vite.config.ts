import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// GitHub Pages（サブパス配信）ではワークフローが BASE_PATH=/dotmon-web/ を渡す。
// ローカル開発・カスタムドメイン移行後は "/" のまま。
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.BASE_PATH || "/",
});
