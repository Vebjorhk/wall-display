# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A fullscreen wall-display app for a homelab, intended to run permanently on a screen. Hosted locally via the Vite dev server — not exposed to the internet. Built with React 19 + TypeScript + Tailwind CSS v4, bundled by Vite 8.

**Location context:** Oslo, Norway.

### Widgets

1. **Transit** — upcoming Ruter departures at the nearest stop via the EnTur JourneyPlanner GraphQL API.
2. **Weather** — current conditions and hourly forecast from the MET Norway Locationforecast API (yr.no).
3. **Pizza deals** — cheapest pizza offers that week from Norwegian grocery stores, sourced from tilbudsaviser (weekly flyers).

## Commands

```bash
npm run dev       # start Vite dev server with HMR
npm run build     # type-check (tsc -b) then produce production build
npm run lint      # run ESLint
npm run preview   # serve the production build locally
```

No test runner is configured.

## Code structure

```
src/
  api/          # one file per data source — all fetch logic lives here, not in components
  components/   # UI components (one per widget + shared primitives)
  App.tsx       # root layout only — no business logic
  main.tsx      # entry point
```

Keep data-fetching strictly inside `src/api/`. Components receive typed props and never call `fetch` directly.

## Stack notes

- **Tailwind v4** — configured via `@tailwindcss/vite` plugin; no `tailwind.config.js` needed. Import with `@import "tailwindcss"` in `index.css`.
- `tsconfig.app.json` has `noUnusedLocals`, `noUnusedParameters`, and `erasableSyntaxOnly` enabled — the build will fail if these are violated.
- `moduleResolution` is `"bundler"` — always include `.tsx` extension on local imports.
