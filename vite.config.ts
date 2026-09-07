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
    build: {
      rollupOptions: {
        output: {
          /**
           * Split the libraries that every route needs into their own chunks.
           *
           * This does not reduce first-load bytes — the same code is still
           * downloaded — but app code changes on every deploy while these
           * change a few times a year, so returning visitors stop re-fetching
           * ~140 kB of React and friends each time.
           *
           * Anything not named here falls through to Vite's own chunking on
           * purpose. jszip in particular is only pulled in by the client
           * gallery download, and Vite already isolates it to that route;
           * sweeping all of node_modules into one vendor chunk would drag it
           * into the initial load and make things worse.
           */
          manualChunks(id) {
            if (!id.includes("node_modules")) return undefined;
            // Match the package directory itself so react-router and other
            // packages merely containing "react" in their name don't land here.
            const normalized = id.replace(/\\/g, "/");
            if (/\/node_modules\/(react|react-dom|scheduler)\//.test(normalized)) {
              return "vendor-react";
            }
            if (normalized.includes("/node_modules/react-router")) {
              return "vendor-router";
            }
            if (normalized.includes("/node_modules/@tanstack/")) {
              return "vendor-query";
            }
            return undefined;
          },
        },
      },
    },
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
