import { Link } from 'react-router-dom'

const HERO_IMG    = '/photos/story-hero.webp'
const STORY_IMG   = '/photos/story.webp'
const LOCATION_IMG = '/photos/location.webp'

export default function OurStory() {
  return (
    <>
      {/* Hero */}
      <section className="px-5 md:px-16 py-20 md:py-28 bg-stone-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-20 items-center">
          <div>
            <span className="font-label-caps text-label-caps text-primary mb-5 block">
              Oglesby, Texas · Est. 2027
            </span>
            <h1 className="font-['Newsreader'] text-4xl md:text-[58px] font-light leading-[1.08] text-on-surface mb-6">
              We've been growing plants <em className="italic text-primary font-normal">our whole lives.</em>
            </h1>
            <p className="font-body-lg text-body-lg text-secondary leading-relaxed max-w-lg mb-10 font-light">
              Kelston Way is a family greenhouse in Oglesby, Texas. We grow annuals, perennials, and seasonal color for garden centers and landscapers. If you want to buy plants, we want to sell to you.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link to="/availability" className="px-8 py-3.5 bg-primary text-on-primary font-button text-button rounded-sm hover:opacity-90 transition-all duration-300">
                View Availability
              </Link>
              <a href="#inquire" className="px-8 py-3.5 border border-primary text-primary font-button text-button rounded-sm hover:bg-primary/5 transition-all duration-300">
                Wholesale Inquiry
              </a>
            </div>
          </div>
          <div className="h-[340px] md:h-[420px] rounded-xl overflow-hidden border border-outline-variant/20 shadow-sm bg-stone-200">
            <img src={HERO_IMG} alt="Kelston Way Greenhouse" className="w-full h-full object-cover object-center" fetchPriority="high" loading="eager" />
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="px-5 md:px-16 py-20 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="pb-3 border-b border-outline-variant/40 mb-12">
            <span className="font-label-caps text-[10px] font-medium tracking-[0.25em] uppercase text-on-surface-variant">Our Story</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-20 items-start">
            <div className="h-[300px] md:h-[360px] rounded-xl overflow-hidden border border-outline-variant/20 shadow-sm bg-stone-200">
              <img src={STORY_IMG} alt="Kelston Way story" className="w-full h-full object-cover object-bottom" loading="lazy" />
            </div>
            <div>
              <h2 className="font-['Newsreader'] text-3xl md:text-[42px] font-light leading-[1.15] text-on-surface mb-6">
                Greenhouses are all we've <em className="italic text-primary font-normal">ever known.</em>
              </h2>
              <p className="font-body-lg text-secondary leading-relaxed font-light mb-5">
                Art, Titus, and Samuel Vanwingerden grew up in the greenhouse business. It's what our family does. We started Kelston Way because we knew we could grow quality plants and build real relationships with the people we sell to.
              </p>
              <p className="font-body-lg text-secondary leading-relaxed font-light">
                Our faith in Jesus Christ is the most important thing to us — it shapes how we work, how we treat people, and what we're building at Kelston Way. We want to run a business we're proud of, that serves our customers well and honors God in the process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="px-5 md:px-16 py-20 md:py-24 bg-stone-50">
        <div className="max-w-7xl mx-auto">
          <div className="pb-3 border-b border-outline-variant/40 mb-12">
            <span className="font-label-caps text-[10px] font-medium tracking-[0.25em] uppercase text-on-surface-variant">What We Stand For</span>
          </div>
          <h2 className="font-['Newsreader'] text-3xl md:text-[42px] font-light leading-[1.15] text-on-surface mb-12">
            What we <em className="italic text-primary font-normal">stand for.</em>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: 'potted_plant',
                title: 'Good Plants',
                body: 'We grow plants we\'re proud to sell. If it\'s not good, it doesn\'t go out the door. Your reputation is on the line too — we take that seriously.',
              },
              {
                icon: 'handshake',
                title: 'Straight Talk',
                body: 'We\'ll tell you what we have, what\'s coming, and what we don\'t have. No runaround. If you email us, we\'ll get back to you.',
              },
              {
                icon: 'location_on',
                title: 'Grown in Texas',
                body: 'Our plants are grown in central Texas, acclimated to the heat, and ready for your customers the day they arrive.',
              },
            ].map(({ icon, title, body }) => (
              <div key={title} className="bg-white border border-outline-variant/30 rounded-sm p-8">
                <span className="material-symbols-outlined text-primary text-3xl mb-4 block">{icon}</span>
                <h3 className="font-['Newsreader'] text-xl text-on-surface mb-3">{title}</h3>
                <p className="font-body-md text-secondary text-sm leading-relaxed font-light">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="px-5 md:px-16 py-20 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="pb-3 border-b border-outline-variant/40 mb-12">
            <span className="font-label-caps text-[10px] font-medium tracking-[0.25em] uppercase text-on-surface-variant">The Family</span>
          </div>
          <h2 className="font-['Newsreader'] text-3xl md:text-[42px] font-light leading-[1.15] text-on-surface mb-12">
            The people behind <em className="italic text-primary font-normal">every plant.</em>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                <div className="w-28 h-28 rounded-full bg-secondary-container border-2 border-outline-variant/30 mx-auto mb-5 flex items-center justify-center">
                  <span className="font-['Newsreader'] text-2xl text-on-surface">{initials}</span>
                </div>
                <h3 className="font-['Newsreader'] text-xl text-on-surface mb-1">{name}</h3>
                <p className="font-label-caps text-[10px] tracking-widest uppercase text-primary mb-3">{role}</p>
                <p className="font-body-md text-secondary text-sm leading-relaxed font-light max-w-[260px] mx-auto">{bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="px-5 md:px-16 py-20 md:py-24 bg-secondary-container/30">
        <div className="max-w-7xl mx-auto">
          <div className="pb-3 border-b border-outline-variant/40 mb-12">
            <span className="font-label-caps text-[10px] font-medium tracking-[0.25em] uppercase text-on-surface-variant">Find Us</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-20 items-center">
            <div>
              <h2 className="font-['Newsreader'] text-3xl md:text-[42px] font-light leading-[1.15] text-on-surface mb-8">
                Five acres in the <em className="italic text-primary font-normal">heart of Texas.</em>
              </h2>
              <div className="space-y-4 font-body-md text-sm text-secondary font-light leading-loose">
                <div><p className="font-medium text-on-surface text-sm mb-0.5">Address</p><p>Oglesby, Coryell County<br />Texas, United States</p></div>
                <div><p className="font-medium text-on-surface text-sm mb-0.5">Opening</p><p>January 1, 2027</p></div>
                <div><p className="font-medium text-on-surface text-sm mb-0.5">Contact</p><p>samuel@kelstonway.com<br />kelstonway.com</p></div>
              </div>
            </div>
            <div className="h-[280px] md:h-[300px] rounded-xl overflow-hidden border border-outline-variant/20 shadow-sm bg-stone-200">
              <img src={LOCATION_IMG} alt="Kelston Way location" className="w-full h-full object-cover" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section id="inquire" className="px-5 md:px-16 py-20 bg-primary text-on-primary text-center">
        <span className="font-label-caps text-[10px] tracking-[0.3em] uppercase text-primary-fixed/70 block mb-4">Wholesale Partners</span>
        <h2 className="font-['Newsreader'] text-3xl md:text-[44px] font-light leading-[1.15] mb-4">
          Want to buy from us?
        </h2>
        <p className="font-body-lg text-primary-fixed/80 font-light mb-10 max-w-xl mx-auto">
          We're opening January 2027. If you're a garden center or landscaper looking for a reliable grower, reach out now and we'll get you set up early.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/contact" className="px-8 py-3.5 bg-secondary-container text-secondary font-button text-button rounded-sm hover:opacity-90 transition-all duration-300">
            Request Wholesale Access
          </Link>
          <Link to="/availability" className="px-8 py-3.5 border border-white/40 text-white font-button text-button rounded-sm hover:bg-white/10 transition-all duration-300">
            View Plant Availability
          </Link>
        </div>
      </section>
    </>
  )
}
