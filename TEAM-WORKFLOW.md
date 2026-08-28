# Team Workflow

How the five of us build one unified site without stepping on each other. You do
**not** need to know a single git command — we use the **GitHub Desktop** app,
which is all buttons.

## The team & who owns what

Each person has a **lane** (a set of files they own). Staying in your lane is what
keeps us from colliding.

| Person | Role | Their lane (files they own) |
| --- | --- | --- |
| Mitch | Motion / Integration | `birds.js`, `clouds.js`, `us-explore.html`, pin/shadow behavior, wiring everyone's work together |
| Twinkle | UX | `explore-ui.js`, mobile/responsive, zoom levels, contrast, callouts |
| Bryan | Design | Source images, `assets/`, general visual design |
| Rob | Design | Map + timeline visuals (`us-relief*.html` styling, timeline look) |
| Copy | Words | Text only — hands copy to Mitch to place (no code) |

> The one file everyone is tempted to touch is `us-explore.html`. **That file is
> Mitch's.** If you need something changed in it, tell Mitch — don't edit it
> yourself.

## The big idea: `main` + your own branch

- **`main`** is the one finished, always-working version of the site — the
  unified asset. **Nobody works directly on `main`.**
- **You get your own branch** — your private copy where you can experiment, make
  a mess, and commit freely without breaking anyone else's work.
- When your piece is ready, it gets **merged into `main`**. **Mitch does the
  merges** (that's the "Integration" role).

```
main  ──●────────●─────────────●────────►  the unified, always-working site
         \        \            ↑ merge
  bryan   ●──●──●   \           │
  rob            ●───●──●───────┘
  twinkle  ●──●──●
```

Your branch names (pick yours from the "Current Branch" dropdown in GitHub Desktop):

- `bryan-design`
- `rob-design`
- `twinkle-ux`
- `mitch-motion`

## One-time setup (each person, ~10 min)

1. Make a free account at https://github.com (turn on 2FA with your phone's
   authenticator).
2. Send your GitHub username to Mitch so he can add you as a **collaborator**.
3. Install **GitHub Desktop**: https://desktop.github.com
4. In GitHub Desktop: `File → Clone repository` → pick `250_website_build` →
   choose a folder on your computer.
5. Click the **Current Branch** dropdown (top of the window) and select **your**
   branch (e.g. `twinkle-ux`). You'll stay on this branch from now on.

## The everyday rhythm

1. **Start on your branch.** Confirm the "Current Branch" dropdown shows your
   name's branch — not `main`.
2. **Get the latest.** Click `Branch → Update from main` (this pulls everyone's
   newest work into your branch so you're never behind).
3. **Do your work** in Cursor / your editor — export assets, tweak motion, write
   copy, etc.
4. **Commit.** Back in GitHub Desktop, write a short **Summary** of what you did
   and click **Commit to `<your-branch>`**. Commit small and often.
5. **Push.** Click **Push origin**.
6. **Ask Mitch to merge.** When a chunk is ready, click **Preview Pull Request →
   Create Pull Request**. Mitch reviews the preview link and merges it into
   `main`.

## The golden rules

> **1. Stay on your own branch.** Never commit to `main`.
>
> **2. `Update from main` before you start each session.** This keeps your branch
> fresh and makes merges painless.
>
> **3. Stay in your lane.** Edit the files you own. Need a change in someone
> else's file? Ask them.

## Design & UX ideas still live in Figma

Figma is the source of truth for *how it should look*. This repo is the source of
truth for *the site that actually ships*. Explore in Figma first, then bring the
final assets/behavior into your branch here.

## If GitHub Desktop says "conflict"

Don't panic. It just means two branches changed the same lines. Ping Mitch (or
whoever last touched that file) — or ask Cursor to help resolve it. Following the
golden rules above makes this rare.

## Where things deploy

- Every merge into `main` triggers an automatic build on Vercel/Netlify.
- The **preview/production link** is the thing to review and share in the group
  chat — nobody needs to read code to give feedback, they just open the link.
