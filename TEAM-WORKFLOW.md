# Team Workflow

How the four of us work on this site without stepping on each other. You do
**not** need to know git commands — we use the **GitHub Desktop** app, which is
all buttons.

## The team

| Person | Role | Mostly works on |
| --- | --- | --- |
| (you) | Motion design | `birds.js`, `clouds.js`, transitions, interaction feel |
| — | UX | Flows, structure, `explore-ui.js` behavior, Figma |
| — | Designer | Visual design, `assets/`, styling, Figma |
| — | Designer | Visual design, `facades/`, imagery, Figma |

## Two layers, two homes

1. **Design & UX ideas live in Figma.** Screens, flows, and visual explorations
   happen there first. Figma is the source of truth for *how it should look*.
2. **The real website lives in this repo.** The code here is the source of truth
   for *the site that actually ships*. Changes get made here, then auto-deploy
   to a preview link everyone can review.

## One-time setup (each person, ~10 min)

1. Make a free personal account at https://github.com (2FA required — use your
   phone's authenticator).
2. Send your GitHub username to the repo owner so they can invite you as a
   **collaborator** (Repo → Settings → Collaborators → Add people).
3. Install **GitHub Desktop**: https://desktop.github.com
4. In GitHub Desktop: `File → Clone repository` → pick this repo → choose a
   folder on your computer.

## The golden rule

> **Pull before you push. Always.**

Git does not lock files. If two people edit the same file at the same time,
whoever pushes second has to reconcile the differences. Pulling first keeps this
painless.

## Everyday rhythm

1. **Open GitHub Desktop** and click **Fetch/Pull origin** to get everyone's
   latest work.
2. **Make your changes** in Cursor / your editor (design exports, motion tweaks,
   copy, etc.).
3. Back in GitHub Desktop, review the changed files, write a short **Summary**
   of what you did, and click **Commit to main**.
4. Click **Push origin**.
5. Vercel/Netlify auto-builds a **preview link** — share it in the group chat
   for feedback. Nobody needs to read code to review; they just open the link.

## Avoiding collisions

- **Coordinate loosely.** A quick "I'm editing `us-explore.html` this afternoon"
  in the group chat prevents 90% of conflicts.
- **Commit small and often** rather than one giant change at the end of the day.
- **Big or risky changes?** Ask the repo owner to make a **branch** for it (still
  one button in GitHub Desktop) so `main` stays stable, then merge when ready.
- If GitHub Desktop ever says "conflict," don't panic — ping whoever last touched
  that file, or ask Cursor to help resolve it.

## Where things deploy

- Every push to `main` triggers an automatic build on Vercel/Netlify.
- The preview/production link is the thing to review and share — not the raw
  files.
