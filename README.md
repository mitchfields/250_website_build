# US Historic Homes

An interactive website exploring historic homes across the United States — an
animated US map, explorable points of interest, and layered motion (birds,
clouds, relief styling).

## Project layout

| Path | What it is |
| --- | --- |
| `index.html` | Landing page |
| `us-explore.html` | Main interactive explore experience |
| `us-relief.html`, `us-relief-dark.html` | Relief map style variants |
| `birds.js`, `clouds.js` | Motion / animation layers |
| `explore-ui.js`, `explore-poi.js` | Explore UI + points-of-interest logic |
| `site-geometry.js`, `us-states-lite.geojson` | Map geometry + state shapes |
| `assets/`, `facades/` | Images and design assets used by the site |
| `screenshots/`, `uploads/` | Reference captures and working screenshots |
| `site/`, `US-Historic-Homes-netlify/` | Deploy snapshots |

## Running locally

It's a static site — no build step. From the project folder:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000 in your browser.

## Working as a team

See [TEAM-WORKFLOW.md](TEAM-WORKFLOW.md) for how we collaborate day to day.
