import { Link } from 'react-router-dom'
import PageMeta from '../components/PageMeta'
import { CONTACT_EMAIL, CONTACT_MAILTO, CONTACT_PHONE, CONTACT_PHONE_HREF } from '../lib/site'

const HERO_IMG = '/photos/story-hero.webp'
const STORY_IMG = '/photos/story.webp'
const LOCATION_IMG = '/photos/location.webp'

// Art's bio is his own verified professional copy (Titus, 2026-08-01). Titus's and
// Samuel's stay deliberately high-level — a lifetime in the industry, no résumé of
// past roles (Samuel, same date). Titles are "Partner" for all three, no hierarchy.
// Art and Titus fall back to initials until headshots land; drop a matching
// /photos/team-*.webp in and set `photo` to swap one in.
const TEAM = [
  {
    initials: 'AV',
    photo: null,
    name: 'Art VanWingerden',
    bio: 'Art VanWingerden has spent more than 45 years in the commercial greenhouse industry. He co-founded and built two national-scale greenhouse operations from the ground up, one of which grew to become the 8th largest greenhouse operation in the nation at its peak. Kelston Way is his next one.',
  },
  {
    initials: 'TV',
    photo: null,
    name: 'Titus VanWingerden',
    bio: 'Titus has been in the industry his whole life, a large part of it running production for a large-scale commercial greenhouse. At Kelston Way he runs day-to-day operations.',
  },
  {
    initials: 'SV',
    photo: '/photos/team-samuel.webp',
    name: 'Samuel VanWingerden',
    bio: 'Samuel has been in the industry his whole life, a large part of it managing replenishment and account service for retail garden centers. At Kelston Way he runs the systems behind planning, inventory, and production, and works directly with customers.',
  },
]

export default function OurStory() {
  return (
    <>
      <PageMeta
        title="Our Story — Kelston Way Greenhouse | Wholesale Grower, Oglesby, Texas"
        description="A family-owned wholesale greenhouse in Oglesby, Texas. Meet the partners behind Kelston Way and how we grow for garden centers and landscape professionals."
      />
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
                Contact Our Team
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

      {/* Story */}
      <section className="bg-white px-5 py-20 md:px-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 border-b border-outline-variant/40 pb-3">
            <span className="font-label-caps text-[10px] font-medium uppercase tracking-[0.25em] text-on-surface-variant">
              Our Story
            </span>
          </div>
          <div className="grid grid-cols-1 items-start gap-16 md:grid-cols-2 md:gap-20">
            <div className="h-[300px] overflow-hidden rounded-xl border border-outline-variant/20 bg-stone-200 shadow-sm md:h-[360px]">
              <img
                src={STORY_IMG}
                alt="Kelston Way story"
                className="h-full w-full object-cover object-bottom"
                loading="lazy"
              />
            </div>
            <div>
              <p className="font-body-lg font-light leading-relaxed text-secondary">
                Art, Titus, and Samuel VanWingerden grew up in the greenhouse business. It's what
                our family does. We started Kelston Way because we knew we could grow quality plants
                and build real relationships with the people we sell to.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="bg-stone-50 px-5 py-20 md:px-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-12 font-['Newsreader'] text-3xl font-light leading-[1.15] text-on-surface md:text-[42px]">
            What we <em className="font-normal italic text-primary">stand for.</em>
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                icon: 'potted_plant',
                title: 'Good Plants',
                body: 'Every plant is graded before it ships, so what you order is what you get.',
              },
              {
                icon: 'handshake',
                title: 'Straight Talk',
                body: "We tell you what we have, what's coming, and what we don't. No runaround.",
              },
              {
                icon: 'location_on',
                title: 'Grown in Texas',
                body: 'Our plants are grown in central Texas, acclimated to the heat, and ready for your customers the day they arrive.',
              },
            ].map(({ icon, title, body }) => (
              <div key={title} className="rounded-sm border border-outline-variant/30 bg-white p-8">
                <span className="material-symbols-outlined mb-4 block text-3xl text-primary">
                  {icon}
                </span>
                <h3 className="mb-3 font-['Newsreader'] text-xl text-on-surface">{title}</h3>
                <p className="font-body-md text-sm font-light leading-relaxed text-secondary">
                  {body}
                </p>
              </div>
            ))}
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
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {TEAM.map(({ initials, photo, name, bio }) => (
              <div
                key={name}
                className="flex h-full flex-col rounded-sm border border-outline-variant/30 bg-stone-50 p-8 text-center"
              >
                <div
                  className={`mx-auto mb-5 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-outline-variant/30 ${
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
                    <span className="font-['Newsreader'] text-2xl text-on-surface">{initials}</span>
                  )}
                </div>
                <h3 className="mb-1 font-['Newsreader'] text-xl text-on-surface">{name}</h3>
                <p className="mb-4 font-label-caps text-[10px] uppercase tracking-widest text-primary">
                  Partner
                </p>
                <p className="font-body-md text-sm font-light leading-relaxed text-secondary">
                  {bio}
                </p>
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
            Contact Our Team
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
