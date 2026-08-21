import { Link } from 'react-router-dom'
import { CONTACT_EMAIL, CONTACT_MAILTO, CONTACT_PHONE, CONTACT_PHONE_HREF } from '../lib/site'

const HERO_IMG = '/photos/story-hero.webp'
const LOCATION_IMG = '/photos/location.webp'

// Bios are Titus's final copy (2026-08-20), sourced from Art's own professional bio.
// They deliberately omit each person's name in the body — the card above carries it.
// Titles split Founder / Partner / Partner, also Titus's call: Art's history carries
// the weight, so the title reflects it. Art and Titus fall back to initials until
// their headshots land; drop a matching /photos/team-*.webp in and set `photo`.
const TEAM = [
  {
    initials: 'AV',
    photo: null,
    name: 'Art VanWingerden',
    role: 'Founder',
    bio: 'Has spent more than 45 years in the commercial greenhouse industry, starting his career in 1980 in a family greenhouse business with roots in the Netherlands. He co-founded Floral Plant Growers in Maryland in 1983, growing it for over a decade before a successful sale in 1996. In 2001, he co-founded Color Point, growing it over the next two decades into one of the largest greenhouse operations in the country — at its peak, the 8th largest in the nation, spanning 115 acres and over 1,000 employees. As primary operator, Art was hands-on in every part of it: production, labor, capital investment, and facility planning. Today, he leads Kelston Way in Texas, alongside his sons, Titus and Samuel.',
  },
  {
    initials: 'TV',
    photo: null,
    name: 'Titus VanWingerden',
    role: 'Partner',
    bio: 'Leads day-to-day operations at Kelston Way, and works alongside his brother on sales.',
  },
  {
    initials: 'SV',
    photo: '/photos/team-samuel.webp',
    name: 'Samuel VanWingerden',
    role: 'Partner',
    bio: 'Leads the technology and systems behind Kelston Way, and works alongside his brother on sales.',
  },
]

export default function MeetTheTeam() {
  return (
    <>
      {/* Hero */}
      <section className="bg-stone-50 px-5 py-20 md:px-16 md:py-28">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 md:grid-cols-2 md:gap-20">
          <div>
            <span className="mb-5 block font-label-caps text-label-caps text-primary">
              Family-Owned Wholesale Grower · Oglesby, Texas
            </span>
            <h1 className="mb-6 font-['Newsreader'] text-4xl font-light leading-[1.08] text-on-surface md:text-[58px]">
              A family-owned wholesale greenhouse in{' '}
              <em className="font-normal italic text-primary">Oglesby, Texas.</em>
            </h1>
            <p className="mb-10 max-w-lg font-body-lg text-body-lg font-light leading-relaxed text-secondary">
              We grow annuals, perennials, and seasonal color for garden centers and landscapers.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/availability"
                className="rounded-sm bg-primary px-8 py-3.5 font-button text-button text-on-primary transition-all duration-300 hover:opacity-90"
              >
                View Availability
              </Link>
              <Link
                to="/contact"
                className="rounded-sm border border-primary px-8 py-3.5 font-button text-button text-primary transition-all duration-300 hover:bg-primary/5"
              >
                Contact Us
              </Link>
            </div>
          </div>
          <div className="h-[340px] overflow-hidden rounded-xl border border-outline-variant/20 bg-stone-200 shadow-sm md:h-[420px]">
            <img
              src={HERO_IMG}
              alt="Kelston Way Greenhouse"
              className="h-full w-full object-cover object-center"
              fetchPriority="high"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-white px-5 py-20 md:px-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 border-b border-outline-variant/40 pb-3">
            <span className="font-label-caps text-[10px] font-medium uppercase tracking-[0.25em] text-on-surface-variant">
              Family Owned. Built for the Long Term.
            </span>
          </div>
          <h2 className="mb-6 font-['Newsreader'] text-3xl font-light leading-[1.15] text-on-surface md:text-[42px]">
            Meet the team behind <em className="font-normal italic text-primary">Kelston Way.</em>
          </h2>
          <p className="mb-14 max-w-3xl font-body-lg font-light leading-relaxed text-secondary">
            Kelston Way brings together decades of commercial greenhouse experience with hands-on
            knowledge in production, operations, replenishment, technology, sales, and customer
            relationships. As a family-owned company, we're building for the long term and staying
            closely involved in the work behind it.
          </p>
          {/* Rows, not a 3-up card grid: Art's bio runs several times longer than his sons',
              and equal-height cards left two of them mostly empty. */}
          <div className="border-t border-outline-variant/40">
            {TEAM.map(({ initials, photo, name, role, bio }) => (
              <div
                key={name}
                className="grid grid-cols-1 items-start gap-8 border-b border-outline-variant/40 py-10 md:grid-cols-[10rem_1fr] md:gap-12 md:py-12"
              >
                <div
                  className={`mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-2 border-outline-variant/30 md:mx-0 md:h-40 md:w-40 ${
                    photo ? 'bg-white' : 'bg-secondary-container'
                  }`}
                >
                  {photo ? (
                    <img
                      src={photo}
                      alt={name}
                      className="h-full w-full object-cover object-top"
                      loading="lazy"
                    />
                  ) : (
                    <span className="font-['Newsreader'] text-3xl text-on-surface">{initials}</span>
                  )}
                </div>
                <div className="text-center md:text-left">
                  <h3 className="mb-1 font-['Newsreader'] text-2xl text-on-surface">{name}</h3>
                  <p className="mb-4 font-label-caps text-[10px] uppercase tracking-widest text-primary">
                    {role}
                  </p>
                  <p className="max-w-3xl font-body-md text-base font-light leading-relaxed text-secondary">
                    {bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="bg-secondary-container/30 px-5 py-20 md:px-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 border-b border-outline-variant/40 pb-3">
            <span className="font-label-caps text-[10px] font-medium uppercase tracking-[0.25em] text-on-surface-variant">
              Where We Grow
            </span>
          </div>
          <div className="grid grid-cols-1 items-center gap-16 md:grid-cols-2 md:gap-20">
            <div>
              <h2 className="mb-8 font-['Newsreader'] text-3xl font-light leading-[1.15] text-on-surface md:text-[42px]">
                Five Acres in the{' '}
                <em className="font-normal italic text-primary">Heart of Texas.</em>
              </h2>
              <p className="mb-8 max-w-lg font-body-md text-sm font-light leading-relaxed text-secondary">
                Kelston Way Greenhouse is based in Oglesby, Coryell County, Texas. For availability,
                orders, or general questions, contact our team.
              </p>
              <div className="space-y-4 font-body-md text-sm font-light leading-loose text-secondary">
                <div>
                  <p className="mb-0.5 text-sm font-medium text-on-surface">Location</p>
                  <p>
                    Oglesby, Coryell County
                    <br />
                    Texas, United States
                  </p>
                </div>
                <div>
                  <p className="mb-0.5 text-sm font-medium text-on-surface">Contact</p>
                  <p>
                    <a href={CONTACT_MAILTO} className="transition-colors hover:text-primary">
                      {CONTACT_EMAIL}
                    </a>
                    <br />
                    <a href={CONTACT_PHONE_HREF} className="transition-colors hover:text-primary">
                      {CONTACT_PHONE}
                    </a>
                  </p>
                </div>
              </div>
            </div>
            <div className="h-[280px] overflow-hidden rounded-xl border border-outline-variant/20 bg-stone-200 shadow-sm md:h-[300px]">
              <img
                src={LOCATION_IMG}
                alt="Kelston Way location"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section id="inquire" className="bg-primary px-5 py-20 text-center text-on-primary md:px-16">
        <h2 className="mb-4 font-['Newsreader'] text-3xl font-light leading-[1.15] md:text-[44px]">
          Contact Us
        </h2>
        <p className="mx-auto mb-10 max-w-xl font-body-lg font-light text-primary-fixed/80">
          If you're a garden center or landscaper looking for a reliable grower, get in touch.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/contact"
            className="rounded-sm bg-secondary-container px-8 py-3.5 font-button text-button text-secondary transition-all duration-300 hover:opacity-90"
          >
            Contact Us
          </Link>
          <Link
            to="/availability"
            className="rounded-sm border border-white/40 px-8 py-3.5 font-button text-button text-white transition-all duration-300 hover:bg-white/10"
          >
            View Availability
          </Link>
        </div>
      </section>
    </>
  )
}
