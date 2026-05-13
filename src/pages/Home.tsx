import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { AvailabilityItem } from '../lib/types'

const HERO_IMG = '/photos/hero1.webp'
const HERO_IMG2 = '/photos/hero2.webp'
const BENTO_IMG = '/photos/bento1.webp'
const BENTO_IMG2 = '/photos/bento2.webp'


export default function Home() {
  const [preview, setPreview] = useState<AvailabilityItem[]>([])
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: release } = await supabase
        .from('availability_releases')
        .select('id')
        .order('published_at', { ascending: false })
        .limit(1)
        .single()
      if (!release) return

      const { data: items } = await supabase
        .from('availability_release_items')
        .select('*, plants(name, sku, size)')
        .eq('release_id', release.id)
        .eq('is_cover', true)
        .eq('website_visible', true)
        .gt('qty_available', 0)
        .limit(3)
      if (items) setPreview(items.map((i: any) => ({
        ...i,
        plant_name: i.plants?.name ?? '',
        plant_sku: i.plants?.sku ?? '',
        plant_size: i.plants?.size ?? '',
      })) as AvailabilityItem[])
    }
    load()
  }, [])

  async function handleInquiry(e: React.FormEvent) {
    e.preventDefault()
    await fetch('/api/send-inquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setSubmitted(true)
    setEmail('')
  }

  return (
    <>
      {/* Hero */}
      <section className="px-5 md:px-32 py-12 md:py-20 flex flex-col md:grid md:grid-cols-12 gap-10 md:gap-16 items-center overflow-hidden">
        <div className="md:col-span-6 z-10">
          <span className="font-label-caps text-label-caps text-secondary mb-4 block">WHOLESALE NURSERY · OGLESBY, TEXAS</span>
          <h1 className="font-['Newsreader'] text-3xl md:text-display-lg text-on-surface mb-6 md:mb-8">
            We grow plants for <span className="italic text-primary">garden centers</span> and landscapers.
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg mb-8 md:mb-10 leading-relaxed text-sm md:text-base">
            Kelston Way is a family greenhouse in central Texas. We grow annuals, perennials, and seasonal color — and we want to sell to you. Email us with any questions.
          </p>
          <div className="flex gap-3 md:gap-4 flex-wrap">
            <Link to="/availability" className="px-6 md:px-8 py-3 md:py-4 bg-primary text-on-primary font-button text-button rounded-sm hover:bg-primary-container transition-all duration-300 text-sm">
              View Availability
            </Link>
            <Link to="/contact" className="px-6 md:px-8 py-3 md:py-4 border border-secondary text-secondary font-button text-button rounded-sm hover:bg-secondary-container/20 transition-all duration-300 text-sm">
              Email Us
            </Link>
          </div>
        </div>
        <div className="md:col-span-6 w-full">
          {/* Mobile: single full-width arch image */}
          <div className="md:hidden relative h-[240px] shape-arch overflow-hidden border border-outline-variant/20 shadow-sm bg-stone-200">
            <img src={HERO_IMG} alt="Kelston Way greenhouse interior" className="w-full h-full object-cover object-bottom" fetchPriority="high" loading="eager" />
          </div>
          {/* Desktop: overlapping arch + pill layout */}
          <div className="hidden md:block relative h-[600px]">
            <div className="absolute top-0 right-0 w-3/4 h-[400px] shape-arch overflow-hidden border border-outline-variant/20 shadow-sm bg-stone-200">
              <img src={HERO_IMG} alt="Kelston Way greenhouse interior" className="w-full h-full object-cover object-bottom" fetchPriority="high" loading="eager" />
            </div>
            <div className="absolute bottom-0 left-0 w-1/2 h-[300px] shape-pill overflow-hidden border border-outline-variant/20 shadow-sm z-20 bg-stone-100">
              <img src={HERO_IMG2} alt="Greenhouse plant detail" className="w-full h-full object-cover" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="px-5 md:px-32 py-16 md:py-24 bg-stone-100">
        <div className="max-w-4xl mb-16">
          <span className="font-label-caps text-label-caps text-secondary mb-4 block">HOW IT WORKS</span>
          <h2 className="font-['Newsreader'] text-headline-xl text-on-surface">Simple and straightforward.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { icon: 'inventory_2', title: 'See What We Have', body: 'We publish our availability each week. Browse the list and order what you need — or email us if you have questions about what\'s coming.' },
            { icon: 'local_shipping', title: 'We Deliver to You', body: 'We deliver to garden centers and landscapers across Texas. Plants arrive healthy and ready for your floor.' },
            { icon: 'handshake', title: 'Work With Us', body: 'We\'re a family business and easy to reach. If you need something specific or want to talk through a regular order, just email us.' },
          ].map(s => (
            <div key={s.title} className="bg-white p-10 border border-outline-variant/30 flex flex-col h-full">
              <span className="material-symbols-outlined text-primary text-4xl mb-6">{s.icon}</span>
              <h3 className="font-['Newsreader'] text-2xl mb-4">{s.title}</h3>
              <p className="font-body-md text-on-surface-variant mb-8 flex-grow">{s.body}</p>
              <Link to="/availability" className="font-button text-button text-primary border-b border-primary/30 pb-1 w-fit hover:border-primary transition-all">
                Learn More
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Live availability strip */}
      {preview.length > 0 && (
        <section className="px-5 md:px-32 py-12 md:py-16">
          <div className="flex justify-between items-center mb-8">
            <div>
              <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest block mb-1">Current Availability</span>
              <h2 className="font-['Newsreader'] text-headline-xl text-on-surface">What We Have This Week</h2>
            </div>
            <Link to="/availability" className="font-button text-button text-primary flex items-center gap-2 group flex-shrink-0 ml-8">
              Full Availability <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
            </Link>
          </div>
          <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory pb-2 -mx-5 px-5 md:mx-0 md:px-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:pb-0">
            {preview.map((item) => (
              <Link key={item.id} to="/availability" className="group cursor-pointer flex-shrink-0 w-40 snap-start md:w-auto">
                <div className="aspect-[3/4] overflow-hidden rounded-sm border border-outline-variant/10 mb-3 bg-surface-container transition-transform duration-500 group-hover:-translate-y-1">
                  <img
                    src={item.photo_url ?? HERO_IMG}
                    alt={item.plant_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex justify-between items-start px-1">
                  <div>
                    <h3 className="font-['Newsreader'] italic text-base text-on-surface group-hover:text-primary transition-colors">{item.plant_name}</h3>
                    <p className="font-body-md text-stone-500 text-xs mt-0.5">{item.plant_size} · {item.qty_available} available</p>
                  </div>
                  {item.unit_price && (
                    <span className="font-label-caps text-[10px] text-on-secondary-fixed-variant bg-secondary-fixed px-2 py-0.5 rounded-full flex-shrink-0 mt-1">${item.unit_price.toFixed(2)}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Bento */}
      <section className="px-5 md:px-32 py-14 md:py-20 bg-stone-50">
        <div className="text-center mb-20 max-w-2xl mx-auto">
          <span className="font-label-caps text-label-caps text-secondary mb-4 block">OUR FACILITY</span>
          <h2 className="font-['Newsreader'] text-headline-xl mb-6">Our Greenhouse</h2>
          <div className="w-12 h-[1px] bg-secondary mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-8 h-auto md:h-[800px]">
          <div className="md:col-span-2 md:row-span-2 relative group overflow-hidden bg-stone-200 rounded-sm">
            <img src={BENTO_IMG} alt="Kelston Way greenhouse" className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-10 left-10 text-white">
              <span className="font-label-caps text-xs uppercase mb-2 block text-stone-200">Oglesby, Texas</span>
              <h3 className="font-['Newsreader'] text-4xl mb-4">5 Acres Under Glass</h3>
              <Link to="/our-story" className="px-6 py-2 border border-white/50 hover:bg-white hover:text-primary transition-all duration-300 font-button text-button inline-block">
                Our Story
              </Link>
            </div>
          </div>
          <div className="md:col-span-2 md:row-span-1 relative group overflow-hidden rounded-sm bg-stone-200">
            <img src={BENTO_IMG2} alt="Plant quality" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
            <div className="absolute inset-0 glass-panel opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="text-center p-8">
                <h3 className="font-['Newsreader'] text-on-surface mb-2 text-2xl">Grown with Care</h3>
                <p className="font-body-md text-on-surface-variant mb-6">Plants we're proud to put our name on.</p>
              </div>
            </div>
            <div className="absolute bottom-6 left-6 group-hover:opacity-0 transition-opacity">
              <h3 className="font-['Newsreader'] text-2xl text-white drop-shadow-md">Grown with Care</h3>
            </div>
          </div>
          <div className="md:col-span-1 md:row-span-1 bg-secondary-container flex flex-col items-center justify-center p-6 text-center rounded-sm">
            <span className="material-symbols-outlined text-3xl mb-3 text-secondary">local_shipping</span>
            <h3 className="font-['Newsreader'] text-lg text-on-secondary-container mb-2">Texas Delivery</h3>
            <p className="font-body-md text-xs text-on-secondary-fixed-variant mb-4">We deliver to garden centers and landscapers across the state.</p>
          </div>
          <div className="md:col-span-1 md:row-span-1 bg-primary flex flex-col items-center justify-center p-6 text-center text-on-primary rounded-sm">
            <span className="material-symbols-outlined text-3xl mb-3">handshake</span>
            <h3 className="font-['Newsreader'] text-lg mb-2">Work With Us</h3>
            <p className="font-body-md text-xs opacity-90 mb-4">Want to buy from us? Email us — we're easy to reach.</p>
            <a href="#inquire" className="font-button text-[10px] uppercase tracking-widest border-b border-white">Apply Now</a>
          </div>
        </div>
      </section>

      {/* Wholesale Inquiry */}
      <section id="inquire" className="px-5 md:px-32 py-16 md:py-32 bg-primary text-on-primary">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="md:w-1/2">
            <h2 className="font-['Newsreader'] text-headline-xl mb-6">Want to buy from <span className="italic opacity-80">us?</span></h2>
            <p className="font-body-lg text-lg opacity-90 leading-relaxed">
              Leave your email and we'll reach out. We sell to garden centers and landscapers — if that's you, we'd love to work together.
            </p>
          </div>
          <div className="md:w-1/2 w-full">
            {submitted ? (
              <p className="font-['Newsreader'] italic text-xl text-primary-fixed">Thanks! We'll be in touch shortly.</p>
            ) : (
              <form onSubmit={handleInquiry} className="space-y-6">
                <div>
                  <label className="font-label-caps text-xs text-primary-fixed block mb-2">BUSINESS EMAIL</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your business email..."
                    className="w-full bg-transparent border-b border-primary-fixed focus:border-white focus:ring-0 text-white placeholder:text-primary-fixed/50 pb-2 transition-colors outline-none"
                  />
                </div>
                <button type="submit" className="w-full py-4 bg-primary-fixed text-on-primary-fixed font-button text-button hover:bg-white transition-colors">
                  Request Access
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
