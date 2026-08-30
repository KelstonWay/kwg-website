import { useState } from 'react'

// The season cards hand off to the fundraiser pitch app rather than pitching here, so
// this page stays a directory: pick a season and the app carries the story, the pricing
// and the sign-up. Spring 2027 is the season actually running; fall and winter say
// "Coming soon" and say it again when tapped, with no link out, until Samuel fills those
// seasons in (Samuel, 2026-08-30). Schools only for now, so the links carry no group.
const PITCH_APP = 'https://kwg-fundraiser.vercel.app/'
const SOON_NOTE = 'We are filling this season in now. Check back soon.'

const SEASONS = [
  { key: 'spring', name: 'Spring', line: 'Hanging baskets and spring annuals', soon: false },
  { key: 'fall', name: 'Fall', line: 'Mums and fall color', soon: true },
  { key: 'winter', name: 'Winter', line: 'Poinsettias', soon: true },
]

function pitchUrl(season: string) {
  return `${PITCH_APP}?season=${season}`
}

export default function Fundraisers() {
  const [tapped, setTapped] = useState<Record<string, boolean>>({})
  return (
    <div className="px-5 py-20 md:px-32">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <span className="mb-4 block font-label-caps text-label-caps text-secondary">
          FUNDRAISERS · WACO AREA
        </span>
        <h1 className="mb-4 font-['Newsreader'] text-3xl text-on-surface md:text-headline-xl">
          Flower fundraisers for <em className="font-normal italic text-primary">schools</em>
        </h1>
        <p className="mb-16 max-w-2xl font-body-lg text-on-surface-variant">
          We grow the flowers, your school sells them, and we deliver to you.
        </p>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {SEASONS.map(({ key: season, name, line, soon }) => (
            <div
              key={season}
              className="flex flex-col rounded-sm border border-outline-variant/40 bg-surface-container-lowest p-6"
            >
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <h2 className="font-['Newsreader'] text-2xl text-on-surface">{name}</h2>
                {soon && (
                  <span className="rounded-full bg-secondary-fixed px-2 py-0.5 font-label-caps text-[10px] text-on-secondary-fixed-variant">
                    Coming soon
                  </span>
                )}
              </div>
              <p className="mb-6 font-body-md text-sm text-on-surface-variant">{line}</p>
              {soon ? (
                <div className="mt-auto flex flex-col gap-2">
                  <button
                    type="button"
                    aria-describedby={tapped[season] ? `${season}-soon` : undefined}
                    onClick={() => setTapped((t) => ({ ...t, [season]: true }))}
                    className="rounded-sm border border-outline-variant bg-surface-container px-6 py-3 text-center font-button text-button text-on-surface-variant transition-all duration-300 hover:bg-surface-container-high"
                  >
                    Coming soon
                  </button>
                  {tapped[season] && (
                    <p
                      id={`${season}-soon`}
                      role="status"
                      className="font-body-md text-sm text-on-surface-variant"
                    >
                      {SOON_NOTE}
                    </p>
                  )}
                </div>
              ) : (
                <a
                  href={pitchUrl(season)}
                  className="mt-auto rounded-sm bg-primary px-6 py-3 text-center font-button text-button text-on-primary transition-all duration-300 hover:bg-primary-container"
                >
                  View fundraiser
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
