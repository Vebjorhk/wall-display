# wall-display

A fullscreen dashboard app designed to run permanently on a wall-mounted screen in a homelab. Shows real-time transit departures, local weather, and weekly grocery pizza deals — tailored for Oslo, Norway.

## Features

- **Ruter departures** — live departure board for your nearest stop via the EnTur API
- **Weather** — current conditions and hourly forecast from yr.no (MET Norway)
- **Pizza deals** — cheapest pizza offers that week across Norwegian grocery stores

## Running

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in a browser. Intended to run fullscreen (`F11`) on the display.
