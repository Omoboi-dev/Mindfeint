import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Proxy API calls to the backend so the browser only talks to one origin.
    proxy: {
      "/api": "http://localhost:8787",
    },
  },
});
