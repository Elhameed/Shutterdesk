import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * VITE_API_URL is inlined at build time, so a Vercel build without it ships a
 * bundle pointing at localhost — the app loads, then every API call fails in
 * the browser with nothing obvious to blame. Fail the deploy instead.
 *
 * Scoped to Vercel (which sets VERCEL=1) so local builds and CI, which have no
 * API to point at, keep working.
 */
function assertDeployEnv(mode: string) {
  const onVercel = Boolean(process.env.VERCEL);
  if (mode === "production" && onVercel && !process.env.VITE_API_URL) {
    throw new Error(
      "VITE_API_URL is not set for this Vercel build.\n" +
        "Set it in Project Settings → Environment Variables, e.g.\n" +
        "  VITE_API_URL=https://shutterdesk-api.onrender.com/api\n" +
        "then redeploy. See docs/DEPLOYMENT.md step 2.",
    );
  }
}

export default defineConfig(({ mode }) => {
  assertDeployEnv(mode);

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        // The API contract, declared once under the server and consumed here.
        // Type-only, so nothing from the server reaches the bundle — see
        // server/src/contracts/README.md.
        "@contracts": path.resolve(__dirname, "./server/src/contracts"),
      },
    },
  };
});
