import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // During local development, Vite proxies /api/* to `vercel dev` if you
    // run that separately, or you can run `vercel dev` alone (it serves both
    // the static site and the /api functions on one port). See README.md.
  },
});
