# Titus round 5 — copy pass

Branch `titus/round-5`, worktree `/home/samuel/kwg-website-titus5`. Nothing pushed, `main` untouched.

Copy rule applied throughout: plain sentences, no em dashes and no spaced hyphens in any line I
wrote or rewrote.

## Items

| # | Change | File | Commit |
|---|--------|------|--------|
| 4 | Home hero swapped. Headline is now "A *family-owned* greenhouse, growing annuals, perennials, and seasonal color." and the body line is "Grown for garden centers and landscapers." Eyebrow unchanged. The italic primary emphasis moved from "garden centers" to "family-owned" so the headline keeps the house style. | `src/pages/Home.tsx` | `bc280a4` |
| 3 | "Grown with Care" tile is now "Quality, Every Tray". It was already a plain label with no link and no gallery behind it, so nothing had to be unwired. | `src/pages/Home.tsx` | `3a0aa3b` |
| 5 | "Our Greenhouse" heading and the short rule under it removed from above the tile grid. The grid itself is unchanged. | `src/pages/Home.tsx` | `3a0aa3b` |
| 1 | Home "Work With Us" tile: "Garden center or landscaper? Email us to get started." is now "Ready to work together? Email us to get started." | `src/pages/Home.tsx` | `3a0aa3b` |
| 1 | Meet the Team hero subhead: now "Growing annuals, perennials, and seasonal color." | `src/pages/MeetTheTeam.tsx` | `ac71ef5` |
| 1 | Meet the Team closing band: now "Looking for a reliable grower? Get in touch." | `src/pages/MeetTheTeam.tsx` | `ac71ef5` |
| 2 | Meet the Team eyebrow: now "Family Owned and Operated." | `src/pages/MeetTheTeam.tsx` | `ac71ef5` |
| 1 | Availability subhead "For garden centers and landscapers." removed entirely. The eyebrow, title, updated date and the empty state are untouched. | `src/pages/Availability.tsx` | `74f7daa` |
| 6 | Facility photo disclaimer added once to the footer fine print, under the copyright line: "Facility photos are from Paris, Kentucky, the greenhouse Art built. This is not our current Kelston Way facility in Oglesby. All plant photography shows product we grew ourselves." The footer renders on every page, so it covers the Home hero and bento shots and the Meet the Team hero and location shots without captioning any plant photo. | `src/components/Footer.tsx` | `8a52d48` |

After the pass, "garden centers and landscapers" appears in visible copy in exactly two places:
the Home hero body line and the footer blurb, as asked.

## Left alone on purpose

- Contact email, Samuel's bio, the Availability empty state and the copyright year: all pending
  Samuel's decision.
- Meta descriptions still say "for garden centers and landscapers" in four places in
  `src/components/RouteMeta.tsx` and two in `index.html`. These are SEO strings in `<head>`, not
  copy anyone reads on the page, and Titus's note was about on-page repetition. Say the word if
  they should track the visible copy.

## Worth a look

- Art's bio on Meet the Team still contains an em dash: "one of the largest greenhouse operations
  in the country — at its peak, the 8th largest in the nation". That is Titus's round-4 copy and
  was not on this list, so I did not touch it, but it is the one remaining dash in user-facing
  copy. It would read fine as "...in the country. At its peak it was the 8th largest in the
  nation, spanning 115 acres and over 1,000 employees."
- With the "Our Greenhouse" heading gone the tile grid sits directly under the hero. It reads
  cleanly at both widths (see the Home screenshots), but it is a noticeably barer top than before.

## Checks

| Check | Command | Result |
|-------|---------|--------|
| Typecheck + build | `npm run build` (`tsc -b && vite build`) | Passed. 407 modules, built in 866ms. Only the pre-existing "chunks larger than 500 kB" advisory. |
| Lint | `npm run lint` | Passed. 0 errors, 6 warnings, all pre-existing `no-explicit-any` in `api/submit-order.ts`, a file this round did not touch. |
| Format | `npx prettier --check` on the four edited files | All match Prettier style. |
| Browser | Dev server on `http://localhost:5199`, Playwright Chromium at 1440x900 and 390x844 | All four pages rendered. No page errors and no console errors on any of the eight loads. |

## Screenshots

All under `/home/samuel/kwg-website-titus5/.superpowers/shots/titus5/` (full page, 2x scale):

- `home-1440.png`, `home-390.png`
- `availability-1440.png`, `availability-390.png`
- `team-1440.png`, `team-390.png`
- `contact-1440.png`, `contact-390.png`

The Availability shots show the empty state, which is deliberate. The Home shots have no
"Available Now" strip for the same reason.
