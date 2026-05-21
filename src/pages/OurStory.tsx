import { Link } from 'react-router-dom'

const HERO_IMG = '/photos/story-hero.webp'
const STORY_IMG = '/photos/story.webp'
const LOCATION_IMG = '/photos/location.webp'

export default function OurStory() {
  return (
    <>
      {/* Hero */}
      <section className="bg-stone-50 px-5 py-20 md:px-16 md:py-28">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 md:grid-cols-2 md:gap-20">
          <div>
            <span className="mb-5 block font-label-caps text-label-caps text-primary">
              Oglesby, Texas · Est. 2027
            </span>
            <h1 className="mb-6 font-['Newsreader'] text-4xl font-light leading-[1.08] text-on-surface md:text-[58px]">
              We've been growing plants{' '}
              <em className="font-normal italic text-primary">our whole lives.</em>
            </h1>
            <p className="mb-10 max-w-lg font-body-lg text-body-lg font-light leading-relaxed text-secondary">
              Kelston Way is a family greenhouse in Oglesby, Texas. We grow annuals, perennials, and
              seasonal color for garden centers and landscapers. If you want to buy plants, we want
              to sell to you.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/availability"
                className="rounded-sm bg-primary px-8 py-3.5 font-button text-button text-on-primary transition-all duration-300 hover:opacity-90"
              >
                View Availability
              </Link>
              <a
                href="#inquire"
                className="rounded-sm border border-primary px-8 py-3.5 font-button text-button text-primary transition-all duration-300 hover:bg-primary/5"
              >
                Wholesale Inquiry
              </a>
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
              <h2 className="mb-6 font-['Newsreader'] text-3xl font-light leading-[1.15] text-on-surface md:text-[42px]">
                Greenhouses are all we've{' '}
                <em className="font-normal italic text-primary">ever known.</em>
              </h2>
              <p className="mb-5 font-body-lg font-light leading-relaxed text-secondary">
                Art, Titus, and Samuel Vanwingerden grew up in the greenhouse business. It's what
                our family does. We started Kelston Way because we knew we could grow quality plants
                and build real relationships with the people we sell to.
              </p>
              <p className="font-body-lg font-light leading-relaxed text-secondary">
                Our faith in Jesus Christ is the most important thing to us — it shapes how we work,
                how we treat people, and what we're building at Kelston Way. We want to run a
                business we're proud of, that serves our customers well and honors God in the
                process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="bg-stone-50 px-5 py-20 md:px-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 border-b border-outline-variant/40 pb-3">
            <span className="font-label-caps text-[10px] font-medium uppercase tracking-[0.25em] text-on-surface-variant">
              What We Stand For
            </span>
          </div>
          <h2 className="mb-12 font-['Newsreader'] text-3xl font-light leading-[1.15] text-on-surface md:text-[42px]">
            What we <em className="font-normal italic text-primary">stand for.</em>
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                icon: 'potted_plant',
                title: 'Good Plants',
                body: "We grow plants we're proud to sell. If it's not good, it doesn't go out the door. Your reputation is on the line too — we take that seriously.",
              },
              {
                icon: 'handshake',
                title: 'Straight Talk',
                body: "We'll tell you what we have, what's coming, and what we don't have. No runaround. If you email us, we'll get back to you.",
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
              The Family
            </span>
          </div>
          <h2 className="mb-12 font-['Newsreader'] text-3xl font-light leading-[1.15] text-on-surface md:text-[42px]">
            The people behind <em className="font-normal italic text-primary">every plant.</em>
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                initials: 'AV',
                name: 'Art Vanwingerden',
                role: 'Founder & CEO',
                bio: 'Decades of greenhouse expertise. Art brings the vision, the relationships, and the standards that define Kelston Way.',
              },
              {
                initials: 'TV',
                name: 'Titus Vanwingerden',
                role: 'Co-Founder & COO',
                bio: 'Hands-on from day one. Titus leads operations — production, growing schedules, and making sure every plant that leaves meets our standard.',
              },
              {
                initials: 'SV',
                name: 'Samuel Vanwingerden',
                role: 'Co-Founder & CFO',
                bio: 'Data-driven and detail-oriented. Samuel manages the financial strategy, operations planning, and business systems.',
              },
            ].map(({ initials, name, role, bio }) => (
              <div key={name} className="text-center">
                <div className="mx-auto mb-5 flex h-28 w-28 items-center justify-center rounded-full border-2 border-outline-variant/30 bg-secondary-container">
                  <span className="font-['Newsreader'] text-2xl text-on-surface">{initials}</span>
                </div>
                <h3 className="mb-1 font-['Newsreader'] text-xl text-on-surface">{name}</h3>
                <p className="mb-3 font-label-caps text-[10px] uppercase tracking-widest text-primary">
                  {role}
                </p>
                <p className="mx-auto max-w-[260px] font-body-md text-sm font-light leading-relaxed text-secondary">
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
              Find Us
            </span>
          </div>
          <div className="grid grid-cols-1 items-center gap-16 md:grid-cols-2 md:gap-20">
            <div>
              <h2 className="mb-8 font-['Newsreader'] text-3xl font-light leading-[1.15] text-on-surface md:text-[42px]">
                Five acres in the{' '}
                <em className="font-normal italic text-primary">heart of Texas.</em>
              </h2>
              <div className="space-y-4 font-body-md text-sm font-light leading-loose text-secondary">
                <div>
                  <p className="mb-0.5 text-sm font-medium text-on-surface">Address</p>
                  <p>
                    Oglesby, Coryell County
                    <br />
                    Texas, United States
                  </p>
                </div>
                <div>
                  <p className="mb-0.5 text-sm font-medium text-on-surface">Opening</p>
                  <p>January 1, 2027</p>
                </div>
                <div>
                  <p className="mb-0.5 text-sm font-medium text-on-surface">Contact</p>
                  <p>
                    samuel@kelstonway.com
                    <br />
                    kelstonway.com
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
        <span className="mb-4 block font-label-caps text-[10px] uppercase tracking-[0.3em] text-primary-fixed/70">
          Wholesale Partners
        </span>
        <h2 className="mb-4 font-['Newsreader'] text-3xl font-light leading-[1.15] md:text-[44px]">
          Want to buy from us?
        </h2>
        <p className="mx-auto mb-10 max-w-xl font-body-lg font-light text-primary-fixed/80">
          We're opening January 2027. If you're a garden center or landscaper looking for a reliable
          grower, reach out now and we'll get you set up early.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/contact"
            className="rounded-sm bg-secondary-container px-8 py-3.5 font-button text-button text-secondary transition-all duration-300 hover:opacity-90"
          >
            Request Wholesale Access
          </Link>
          <Link
            to="/availability"
            className="rounded-sm border border-white/40 px-8 py-3.5 font-button text-button text-white transition-all duration-300 hover:bg-white/10"
          >
            View Plant Availability
          </Link>
        </div>
      </section>
    </>
  )
}
