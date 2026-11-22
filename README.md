# Checkout button A/B test (Flagsmith Experimentation demo)

A one-page demo shop that A/B tests the copy on its checkout button with
[Flagsmith Experimentation](https://docs.flagsmith.com/experimentation/run-an-experiment).

| | |
|---|---|
| Flag | `checkout_button` (multivariate) |
| Control | `control`, shown as **Buy now** |
| Variation | `get_it_today`, shown as **Get it today** |
| Conversion event | `purchase_completed`, sent when an order is confirmed |
| Identity | a random `user_…` ID per visitor, kept in `localStorage` |

## Run it

Requires Node 18+ and a Flagsmith instance (these defaults point at a local one on `http://localhost:8000`).

```bash
npm install
cp public/config.example.js public/config.js   # then set environmentID
npm start                                       # http://localhost:3000
```

`public/config.js` holds your environment key and is ignored by git.

## Simulate traffic

```bash
FLAGSMITH_ENVIRONMENT_KEY=<client-side key> npm run simulate
```

Creates 300 users (`USERS=` to change), gets the experiment flag for each and
tracks `purchase_completed` for some of them, using made-up purchase rates.

## Where the code is

- `public/app.js`: SDK init with events, `identify`, `getExperimentFlag` where the
  button renders, `trackEvent('purchase_completed')` on purchase, `flushEvents` on `pagehide`.
- `simulate.js`: the traffic script.
- `server.js`: static server that also serves the SDK's ES module from `node_modules`.
