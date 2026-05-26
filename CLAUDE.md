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

## Transit departure algorithm

The transit widget is the most complex part of the codebase. Several non-obvious decisions were made after debugging — touch this carefully.

### ID uniqueness
`serviceJourney.id` from the EnTur API is **not unique per departure** at a stop. Loop routes and stops with multiple platforms can return the same serviceJourney ID multiple times in a single response. The stable unique key is:
```ts
id: `${call.serviceJourney.id}:${call.aimedDepartureTime}`
```
Never revert to using `serviceJourney.id` alone — React will render duplicate rows and the count will exceed 10.

### State model (`useDepartures`)
There are two driving mechanisms:

1. **30s API poll** — refreshes `expectedDepartureTime` values (captures delays). Handled by `mergeWithFresh`.
2. **1s tick** — transitions `upcoming → departed` when `expectedDepartureTime` passes, and cleans up entries older than 90s.

`mergeWithFresh` has two important guards:
- **Anti-resurrection**: fresh API entries whose `expectedDepartureTime <= now` are filtered out — prevents a delayed train from jumping back from "Nå" to "3 min" mid-display.
- **Race guard** (`justMissed`): if the poll fires at the exact second a departure expires (before the 1s tick), the entry is still `upcoming` in `prev` with a past time. Without this guard it silently drops from state without animating. `justMissed` catches these and transitions them to `departed` inline.

### Ordering and the 10-row limit
All departures (upcoming + departed) are sorted together by `expectedDepartureTime` ascending and sliced to 10 **in `TransitBoard`**, not in the hook. Departed entries have past timestamps so they naturally float to position 0 (top). Do not put departed entries at the end of the list — they get sliced away before they're visible and no animation plays.

### Departure lifecycle (display phases)
Each departure goes through these visual phases after its time passes:

| Phase | Duration | Appearance | Condition |
|---|---|---|---|
| Countdown | until t=0 | Normal row, "X min" / "1 min" | `status === 'upcoming'` |
| Nå | 0–10s | Full opacity, red glow, "Nå" | `isDeparted && age < 10s` |
| Waiting | 10s+, no replacement | 35% opacity, "Nå" | `isDeparted && age >= 10s && !hasReplacement` |
| Exiting | 10s+, replacement ready | Exit animation (0.6s) | `isDeparted && age >= 10s && hasReplacement` |

`hasReplacement` is true when there are ≥10 upcoming departures for that direction — meaning an 11th entry is waiting in state to fill the slot the moment the departed row is dropped from `visible`. `TransitBoard` drops the row from the rendered list at `age >= 11s && hasReplacement` (1 second after animation starts). The 90s state cleanup in the tick is just a safety net.

### Time label
Use `Math.ceil(msLeft / 60_000)` for the minute label, not `Math.floor`. This keeps the display at "1 min" for the full last minute instead of jumping to "0 min" or a seconds countdown. "Nå" only appears when `msLeft <= 0`.

### What to be careful about
- **Don't shorten the 90s state window** without also adjusting `hasReplacement` and the `visible` filter in TransitBoard — the hook, component, and CSS animation timing are coupled.
- **Don't sort departed entries separately** from upcoming and concatenate — they must be sorted together so departed entries stay at position 0, not jump to the bottom on status change.
- **The exit animation keyframe starts at `opacity: 1`** because the Nå phase is full opacity. If a future design adds a grey phase before exiting, update the 0% keyframe to match.
- **React StrictMode** runs effects twice in development. The `mounted` flag and `clearInterval` in the polling effect handle this correctly — don't remove them.

## Stack notes

- **Tailwind v4** — configured via `@tailwindcss/vite` plugin; no `tailwind.config.js` needed. Import with `@import "tailwindcss"` in `index.css`.
- `tsconfig.app.json` has `noUnusedLocals`, `noUnusedParameters`, and `erasableSyntaxOnly` enabled — the build will fail if these are violated.
- `moduleResolution` is `"bundler"` — always include `.tsx` extension on local imports.
