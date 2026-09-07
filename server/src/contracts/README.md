# API contracts

The wire format between the API and the SPA, declared once.

These types were previously written out by hand on both sides — eleven of them,
with no compile-time link. They had already drifted: the server called one
`ApiClient` while the client called the same payload `ApiStudioClient`, and the
error type diverged so far that the per-field validation errors the API returns
were invisible to every form in the app.

## Why they live under `server/src`

The obvious home is a root-level `packages/contracts` workspace, but two
constraints rule it out:

- Render builds the API with `rootDir: server`, and the server's `tsc` uses
  `rootDir: src`. A package outside `src/` cannot be compiled into `dist/`
  without a separate build step and a build-order dependency in the deploy.
- `npm install` inside `server/` would resolve against a workspace root above
  it. This repo has already been bitten by npm's root/prefix behaviour — see
  the install note in `docs/ARCHITECTURE.md` §2.

Putting them here costs nothing on either side: the server compiles them as
ordinary source, and the frontend reaches them through the `@contracts/*`
tsconfig path and matching Vite alias. The dependency direction is right anyway
— the API defines the contract, the client consumes it.

## The one rule

**Types only. No values, no imports of server code.**

The frontend resolves this directory directly. A runtime value here would be
bundled into the browser, and an import of anything under `lib/` or `domain/`
would drag Prisma in with it. Everything in this folder must erase at compile
time.

Prisma enums are re-declared as string unions rather than imported from
`@prisma/client` for the same reason.
