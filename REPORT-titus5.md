# Titus round 5

Branch `titus/round-5`, worktree `/home/samuel/kwg-website-titus5`. Nothing pushed, `main` untouched.

Copy rule applied throughout: plain sentences, no em dashes, no spaced hyphens and no exclamation
marks in any line I wrote or rewrote.

Round 5 came in two passes. The first was Titus's six copy items; the second was Samuel's two
answers, his bio and the Fundraisers section. Both are on this branch.

## Pass one: Titus's copy items

| #   | Change                                                                                                                                                                                                                                                                                                                                                                                                                                        | File                         | Commit    |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | --------- |
| 4   | Home hero swapped. Headline is now "A _family-owned_ greenhouse, growing annuals, perennials, and seasonal color." and the body line is "Grown for garden centers and landscapers." Eyebrow unchanged. The italic primary emphasis moved from "garden centers" to "family-owned" so the headline keeps the house style.                                                                                                                       | `src/pages/Home.tsx`         | `bc280a4` |
| 3   | "Grown with Care" tile is now "Quality, Every Tray". It was already a plain label with no link and no gallery behind it, so nothing had to be unwired.                                                                                                                                                                                                                                                                                        | `src/pages/Home.tsx`         | `3a0aa3b` |
| 5   | "Our Greenhouse" heading and the short rule under it removed from above the tile grid. The grid itself is unchanged.                                                                                                                                                                                                                                                                                                                          | `src/pages/Home.tsx`         | `3a0aa3b` |
| 1   | Home "Work With Us" tile: "Garden center or landscaper? Email us to get started." is now "Ready to work together? Email us to get started."                                                                                                                                                                                                                                                                                                   | `src/pages/Home.tsx`         | `3a0aa3b` |
| 1   | Meet the Team hero subhead: now "Growing annuals, perennials, and seasonal color."                                                                                                                                                                                                                                                                                                                                                            | `src/pages/MeetTheTeam.tsx`  | `ac71ef5` |
| 1   | Meet the Team closing band: now "Looking for a reliable grower? Get in touch."                                                                                                                                                                                                                                                                                                                                                                | `src/pages/MeetTheTeam.tsx`  | `ac71ef5` |
| 2   | Meet the Team eyebrow: now "Family Owned and Operated."                                                                                                                                                                                                                                                                                                                                                                                       | `src/pages/MeetTheTeam.tsx`  | `ac71ef5` |
| 1   | Availability subhead "For garden centers and landscapers." removed entirely. The eyebrow, title, updated date and the empty state are untouched.                                                                                                                                                                                                                                                                                              | `src/pages/Availability.tsx` | `74f7daa` |
| 6   | Facility photo disclaimer added once to the footer fine print, under the copyright line: "Facility photos are from Paris, Kentucky, the greenhouse Art built. This is not our current Kelston Way facility in Oglesby. All plant photography shows product we grew ourselves." The footer renders on every page, so it covers the Home hero and bento shots and the Meet the Team hero and location shots without captioning any plant photo. | `src/components/Footer.tsx`  | `8a52d48` |

After the pass, "garden centers and landscapers" appears in visible copy in exactly two places:
the Home hero body line and the footer blurb, as asked.

## Pass two: Samuel's answers

| Item | Change                                                                                                                                                                                                                                                                                                                                   | File                                                                                                                              | Commit                            |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| A    | Samuel's bio drops the growing-site clause and Home Depot, and keeps his closing line. It now reads: "Samuel grew up in the greenhouse industry and worked alongside Art and Titus, where he led live-goods replenishment for more than 100 big box retail stores. At Kelston Way, he leads technology, business innovation, and sales." | `src/pages/MeetTheTeam.tsx`                                                                                                       | `a2d88e6`, corrected in `cb9cf58` |
| B    | Fundraisers section: new `/fundraisers` page, nav entry, footer link and route metadata.                                                                                                                                                                                                                                                 | `src/pages/Fundraisers.tsx`, `src/App.tsx`, `src/components/Nav.tsx`, `src/components/Footer.tsx`, `src/components/RouteMeta.tsx` | `5999692`                         |

### How the Fundraisers page is built (B)

- Header: eyebrow "FUNDRAISERS · WACO AREA", heading "Flower fundraisers for _schools and
  churches_" with the same italic primary emphasis the Home and Meet the Team headlines use, then
  the single intro line "We grow the flowers, your group sells them, and we deliver to you."
- Two groups, Schools then Churches, each under the same underlined label-caps eyebrow the Meet
  the Team page uses for "Where We Grow". Three cards per group: Spring, Fall, Winter.
- Cards carry the season name in Newsreader, one line of copy, and a "View fundraiser" button in
  the primary green. Fall and Winter also carry a "Coming soon" chip in the same quiet
  `secondary-fixed` pill the Home availability strip uses for prices. Their links stay live.
- All six links open in the same tab and were read back out of the rendered DOM:

  ```
  https://kwg-fundraiser.vercel.app/?season=spring&for=school
  https://kwg-fundraiser.vercel.app/?season=fall&for=school
  https://kwg-fundraiser.vercel.app/?season=winter&for=school
  https://kwg-fundraiser.vercel.app/?season=spring&for=church
  https://kwg-fundraiser.vercel.app/?season=fall&for=church
  https://kwg-fundraiser.vercel.app/?season=winter&for=church
  ```

- Nav reads Home · Availability · Fundraisers · Meet the Team · Contact · Account on desktop and
  in the mobile menu, both off the one `NAV_LINKS` array.
- The footer link went under COMPANY, not WHOLESALE. The WHOLESALE column is the buyer's ordering
  lane, Current Availability and Place an Order, and a school or church raising money is not
  placing a wholesale order. Easy to move if you disagree.
- No new fonts, colors, images or components. Everything comes from the existing Tailwind tokens.
- No CSP change needed: the site's policy restricts `connect-src`, which governs fetch and XHR,
  not a plain link navigation to another origin.
- `/fundraisers` also got a `RouteMeta` entry, otherwise it would wear the site-wide default
  description. Title is "Fundraisers | Kelston Way Greenhouse", using the pipe already in that
  file rather than the dash the older entries use.

## Pass three: Codex adversarial review

Commit `cb9cf58`. All of it lands on the home page except the bio correction.

| Finding                                                                                                                                                           | What changed                                                                                                                                                                                                                                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HIGH, `Home.tsx:217`: the eyebrow read OGLESBY, TEXAS over the tile whose photo is the Paris, Kentucky greenhouse, contradicting the disclaimer added this round. | The eyebrow now reads OUR GREENHOUSE. The photo stays.                                                                                                                                                                                                                                                                                          |
| MEDIUM, `Home.tsx:117`, `:128`, `:210`: three facility images claimed to be Kelston Way in their alt text.                                                        | Hero images now read "Greenhouse interior at the Paris, Kentucky facility Art built" and the tile image reads "Greenhouse at the Paris, Kentucky facility Art built". The plant photos, `hero2` and `bento2`, were left alone: the disclaimer says plant photography shows product we grew ourselves, so those alts are already true.           |
| MEDIUM, `Home.tsx:205`: the tile grid lost its visible h2 earlier this round, breaking the heading order.                                                         | Added an sr-only h2, "What we offer". This matters more than it looks: the visible "Available Now" h2 only renders when there is a published release, so with an empty availability strip the tile h3s were sitting straight under the h1. Heading order read back from the live page is now h1, h2 "What we offer", four h3s, h2 "Contact Us". |
| Two LOW items asking for Titus's headline fragments to be turned into full sentences.                                                                             | Titus's wording kept.                                                                                                                                                                                                                                                                                                                           |

The bio correction in the same commit restores "he leads technology, business innovation, and sales",
which pass two had dropped. The only cuts Samuel approved were the growing-site clause and Home
Depot. Titus's line was not touched at any point.

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

Run after each pass. Results below are the final run, with all three passes in the tree.

| Check             | Command                                                                            | Result                                                                                                                                                                                                                                                                                                            |
| ----------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Typecheck + build | `npm run build` (`tsc -b && vite build`)                                           | Passed. Built in 719ms. Only the pre-existing "chunks larger than 500 kB" advisory.                                                                                                                                                                                                                               |
| Lint              | `npm run lint`                                                                     | Passed. 0 errors, 6 warnings, all pre-existing `no-explicit-any` in `api/submit-order.ts`, a file this round did not touch.                                                                                                                                                                                       |
| Format            | `npx prettier --check src api index.html`                                          | All matched files use Prettier style.                                                                                                                                                                                                                                                                             |
| Browser           | Dev server on `http://localhost:5199`, Playwright Chromium at 1440x900 and 390x844 | Home, Availability, Meet the Team, Contact and Fundraisers all render. No page errors and no console errors on any load. Read back out of the live DOM: the six fundraiser links, the nav order, the page title, the footer link, the bio text, the home page heading order and every image alt on the home page. |

## Screenshots

All under `/home/samuel/kwg-website-titus5/.superpowers/shots/titus5/` (full page, 2x scale):

- `home-1440.png`, `home-390.png` (retaken after the review fixes)
- `availability-1440.png`, `availability-390.png`
- `team-1440.png`, `team-390.png` (retaken after the bio correction)
- `contact-1440.png`, `contact-390.png`
- `fundraisers-1440.png`, `fundraisers-390.png`

The Availability shots show the empty state, which is deliberate. The Home shots have no
"Available Now" strip for the same reason.

## Pass four: Samuel's rulings

Five commits. Samuel's rulings override Titus wherever they differ, so a few things this report
flagged earlier as deliberately left alone were changed here.

| Ruling | Change                                                                                                                                                                                                                                                                                                                                                                | File                                                        | Commit    |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | --------- |
| 1      | Home hero eyebrow now reads "WHOLESALE GROWER · WACO AREA, TEXAS".                                                                                                                                                                                                                                                                                                    | `src/pages/Home.tsx`                                        | `5bda062` |
| 1      | Meet the Team eyebrow now "Family-Owned Wholesale Grower · Waco Area, Texas", the h1 now "A family-owned wholesale greenhouse in the _Waco area, Texas._" with the italic emphasis on the place, the Find Us paragraph now "Kelston Way Greenhouse is based in the Waco area of Texas.", and its Location block now "Waco area / Texas, United States".               | `src/pages/MeetTheTeam.tsx`                                 | `5bda062` |
| 1      | Contact page location line now "Waco area, Texas".                                                                                                                                                                                                                                                                                                                    | `src/pages/Contact.tsx`                                     | `5bda062` |
| 1      | Footer blurb now "A family-owned wholesale grower in the Waco area, ...", the CONTACT column now one line, "Waco area, Texas", and the copyright line now "· Waco Area, Texas".                                                                                                                                                                                       | `src/components/Footer.tsx`                                 | `5bda062` |
| 1      | Metadata: the description and og:description in `index.html`, the default description, and the availability, team and contact entries all say Waco area, and the buyer-type tail came off every meta description so each is one plain sentence. The team and contact titles read "Wholesale Grower, Waco Area, Texas".                                                | `index.html`, `src/components/RouteMeta.tsx`                | `9d13756` |
| 2      | The facility note is now one line of fine print under the copyright: "Facility photos show the Paris, Kentucky greenhouse Art built, not our Waco area site. Plant photos are our own." It uses the smallest muted body type the site already ships, `font-body-md text-[10px] text-stone-500`, measured at 10px in the browser. It appears nowhere else on the site. | `src/components/Footer.tsx`                                 | `0f66848` |
| 3      | Fundraisers is schools only. The Churches group and its three cards are gone, the heading is "Flower fundraisers for _schools_", the intro is "We grow the flowers, your school sells them, and we deliver to you.", and the three links dropped the group parameter. Route metadata follows. Nav and footer entries untouched.                                       | `src/pages/Fundraisers.tsx`, `src/components/RouteMeta.tsx` | `ea65541` |

Commit `924ec2c` is prettier reflow only, no wording in it.

### Meta descriptions as they now read

- Default and `index.html`: "Kelston Way is a family-owned wholesale greenhouse in the Waco area, Texas, growing annuals, perennials, and seasonal color."
- `index.html` og:description: "A family-owned wholesale grower in the Waco area, Texas, supplying annuals, perennials, and seasonal color."
- Availability: "This week's wholesale availability from Kelston Way Greenhouse in the Waco area, Texas, with annuals, perennials, and seasonal color." The em dash that string carried is gone with it.
- Meet the Team: "Meet the family behind Kelston Way Greenhouse, a family-owned wholesale greenhouse in the Waco area, Texas."
- Contact: "Contact the Kelston Way Greenhouse team about wholesale availability, orders, standing orders, or growing programs."
- Fundraisers: "Flower fundraisers for schools in the Waco area. We grow the flowers, your school sells them, and we deliver to you."

### Fundraiser links, read back out of the live DOM

```
https://kwg-fundraiser.vercel.app/?season=spring
https://kwg-fundraiser.vercel.app/?season=fall
https://kwg-fundraiser.vercel.app/?season=winter
```

### Oglesby and Coryell

`grep -rn "Oglesby\|Coryell\|OGLESBY\|CORYELL" src index.html api public` returns nothing. There is
no true postal address anywhere in the site, so nothing had grounds to stay. Two code comments
named the town, one in the footer and one over the home bento tile; both were reworded rather than
left, since the pages they explain no longer name it. No page renders the word: the body text of
Home, Fundraisers, Meet the Team and Contact was read back at 1440 and tested against
`/Oglesby|Coryell/i`, and all four came back false.

### Judgment calls

- The single "Schools" group label above the cards came out with the grouping. With one audience it
  only repeated the heading two lines above it. Say the word and it goes back.
- The footer blurb keeps "to garden centers and landscapers". The ruling scoped that cut to the meta
  strings, and the blurb is the wholesale positioning line, not a meta description.
- Art's bio on Meet the Team still carries the one em dash flagged in pass three. Still not on any
  list.

### Checks

| Check             | Command                                                                            | Result                                                                                                                                                                                                                                                                                                 |
| ----------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Typecheck + build | `npm run build`                                                                    | Passed, built in 646ms. Only the pre-existing chunk-size advisory.                                                                                                                                                                                                                                     |
| Lint              | `npm run lint`                                                                     | Passed. 0 errors, 6 warnings, all pre-existing `no-explicit-any` in `api/submit-order.ts`.                                                                                                                                                                                                             |
| Format            | `npx prettier --check src api index.html`                                          | All matched files use Prettier style.                                                                                                                                                                                                                                                                  |
| Browser           | Dev server on `http://localhost:5207`, Playwright Chromium at 1440x900 and 390x844 | Home, Fundraisers, Meet the Team and Contact all render. No console errors and no page errors at either width. Read back out of the live DOM: every Waco line above, the three fundraiser links, the four page titles and descriptions, and the computed font size and color of the footer fine print. |

Screenshots retaken into `/home/samuel/kwg-website-titus5/.superpowers/shots/titus5/`: `home-1440.png`,
`home-390.png`, `fundraisers-1440.png`, `fundraisers-390.png`, `team-1440.png`, `team-390.png`,
`contact-1440.png`, `contact-390.png`. The availability shots are from pass three and still current;
that page did not change.

The dev server this pass started was stopped when it finished. Nothing was pushed and `main` was
never touched.
