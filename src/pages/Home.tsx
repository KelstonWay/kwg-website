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
        .eq('status', 'current')
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false })
        .limit(1)
        .single()
      if (!release) return

      const { data: items } = await supabase
        .from('availability_release_items')
        .select('*, plants(name, sku, size)')
        .eq('release_id', release.id)
        .eq('website_visible', true)
        .gt('qty_available', 0)
        .order('photo_url', { ascending: false, nullsFirst: false })
        .order('qty_available', { ascending: false })
        .limit(3)
      if (items)
        setPreview(
          items.map((i) => ({
            ...i,
            plant_name: i.plants?.name ?? '',
            plant_sku: i.plants?.sku ?? '',
            plant_size: i.plants?.size ?? '',
            plant_type: null,
          })) as AvailabilityItem[]
        )
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
      <section className="flex flex-col items-center gap-10 overflow-hidden px-5 py-12 md:grid md:grid-cols-12 md:gap-16 md:px-32 md:py-20">
        <div className="z-10 md:col-span-6">
          <span className="mb-4 block font-label-caps text-label-caps text-secondary">
            WHOLESALE GROWER · OGLESBY, TEXAS
          </span>
          <h1 className="mb-6 font-['Newsreader'] text-3xl text-on-surface md:mb-8 md:text-display-lg">
            We grow plants for <span className="italic text-primary">garden centers</span> and
            landscapers.
          </h1>
          <p className="mb-8 max-w-lg font-body-lg text-body-lg text-sm leading-relaxed text-on-surface-variant md:mb-10 md:text-base">
            A family-owned wholesale greenhouse in Oglesby, Texas, growing annuals, perennials, and
            seasonal color.
          </p>
          <div className="flex flex-wrap gap-3 md:gap-4">
            <Link
              to="/availability"
              className="rounded-sm bg-primary px-6 py-3 font-button text-button text-sm text-on-primary transition-all duration-300 hover:bg-primary-container md:px-8 md:py-4"
            >
              View Availability
            </Link>
            <Link
              to="/contact"
              className="rounded-sm border border-secondary px-6 py-3 font-button text-button text-sm text-secondary transition-all duration-300 hover:bg-secondary-container/20 md:px-8 md:py-4"
            >
              Email Us
            </Link>
          </div>
        </div>
        <div className="w-full md:col-span-6">
          {/* Mobile: single full-width arch image */}
          <div className="relative h-[240px] overflow-hidden rounded-xl border border-outline-variant/20 bg-stone-200 shadow-sm md:hidden">
            <img
              src={HERO_IMG}
              alt="Kelston Way greenhouse interior"
              className="h-full w-full object-cover object-center"
              fetchPriority="high"
              loading="eager"
            />
          </div>
          {/* Desktop: overlapping arch + pill layout */}
          <div className="relative hidden h-[600px] md:block">
            <div className="shape-arch absolute right-0 top-0 h-[400px] w-3/4 overflow-hidden border border-outline-variant/20 bg-stone-200 shadow-sm">
              <img
                src={HERO_IMG}
                alt="Kelston Way greenhouse interior"
                className="h-full w-full object-cover object-bottom"
                fetchPriority="high"
                loading="eager"
              />
            </div>
            <div className="shape-pill absolute bottom-0 left-0 z-20 h-[300px] w-1/2 overflow-hidden border border-outline-variant/20 bg-stone-100 shadow-sm">
              <img
                src={HERO_IMG2}
                alt="Greenhouse plant detail"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Live availability strip */}
      {preview.length > 0 && (
        <section className="px-5 py-12 md:px-32 md:py-16">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-['Newsreader'] text-headline-xl text-on-surface">Available Now</h2>
            <Link
              to="/availability"
              className="group ml-8 hidden flex-shrink-0 items-center gap-2 font-button text-button text-primary md:flex"
            >
              Full Availability{' '}
              <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">
                arrow_forward
              </span>
            </Link>
          </div>
          <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0">
            {preview.map((item) => (
              <Link
                key={item.id}
                to="/availability"
                className="group w-40 flex-shrink-0 cursor-pointer snap-start md:w-auto"
              >
                <div className="mb-3 aspect-[3/4] overflow-hidden rounded-lg border border-outline-variant/10 bg-surface-container transition-transform duration-500 group-hover:-translate-y-1">
                  <img
                    src={item.photo_url ?? HERO_IMG}
                    alt={item.plant_name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex items-start justify-between px-1">
                  <div>
                    <h3 className="font-['Newsreader'] text-base italic text-on-surface transition-colors group-hover:text-primary">
                      {item.plant_name}
                    </h3>
                    <p className="mt-0.5 font-body-md text-xs text-stone-500">
                      {item.plant_size} · {item.qty_available} trays available
                    </p>
                  </div>
                  {item.unit_price && (
                    <span className="mt-1 flex-shrink-0 rounded-full bg-secondary-fixed px-2 py-0.5 font-label-caps text-[10px] text-on-secondary-fixed-variant">
                      ${item.unit_price.toFixed(2)}/tray
                    </span>
                  )}
                </div>
              </Link>
            ))}
            {/* View more tile — mobile only */}
            <Link
              to="/availability"
              className="flex aspect-[3/4] w-40 flex-shrink-0 snap-start flex-col items-center justify-center rounded-lg border border-outline-variant/30 bg-surface-container text-primary transition-colors hover:bg-primary-fixed/10 md:hidden"
            >
              <span className="material-symbols-outlined mb-2 text-3xl">arrow_forward</span>
              <span className="font-button text-sm">View more</span>
            </Link>
          </div>
        </section>
      )}

      {/* Bento */}
      <section className="bg-stone-50 px-5 py-14 md:px-32 md:py-20">
        <div className="mx-auto mb-20 max-w-2xl text-center">
          <h2 className="mb-6 font-['Newsreader'] text-headline-xl">Our Greenhouse</h2>
          <div className="mx-auto h-[1px] w-12 bg-secondary" />
        </div>
        <div className="grid h-auto grid-cols-1 grid-rows-2 gap-8 md:h-[800px] md:grid-cols-4">
          <div className="group relative overflow-hidden rounded-sm bg-stone-200 md:col-span-2 md:row-span-2">
            <img
              src={BENTO_IMG}
              alt="Kelston Way greenhouse"
              className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-10 left-10 text-white">
              <span className="mb-2 block font-label-caps text-xs uppercase text-stone-200">
                Oglesby, Texas
              </span>
              <h3 className="mb-4 font-['Newsreader'] text-4xl">5 Acres of Growing Space</h3>
              <Link
                to="/our-story"
                className="inline-block border border-white/50 px-6 py-2 font-button text-button transition-all duration-300 hover:bg-white hover:text-primary"
              >
                Our Story
              </Link>
            </div>
          </div>
          <div className="group relative overflow-hidden rounded-sm bg-stone-200 md:col-span-2 md:row-span-1">
            <img
              src={BENTO_IMG2}
              alt="Plant quality"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            {/* Titus 2026-08-01: hover panel dropped, photo keeps its label only. The
                scrim replaces the contrast the panel used to give the label. */}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-6 left-6">
              <h3 className="font-['Newsreader'] text-2xl text-white drop-shadow-md">
                Grown with Care
              </h3>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center rounded-sm bg-secondary-container p-6 text-center md:col-span-1 md:row-span-1">
            <span className="material-symbols-outlined mb-3 text-3xl text-secondary">
              calendar_month
            </span>
            <h3 className="mb-2 font-['Newsreader'] text-lg text-on-secondary-container">
              Weekly Availability
            </h3>
            <p className="mb-4 font-body-md text-xs text-on-secondary-fixed-variant">
              See what's currently available from the greenhouse.
            </p>
          </div>
          <div className="flex flex-col items-center justify-center rounded-sm bg-primary p-6 text-center text-on-primary md:col-span-1 md:row-span-1">
            <span className="material-symbols-outlined mb-3 text-3xl">handshake</span>
            <h3 className="mb-2 font-['Newsreader'] text-lg">Work With Us</h3>
            <p className="mb-4 font-body-md text-xs opacity-90">
              Garden center or landscaper? Email us to get started.
            </p>
            <a
              href="#inquire"
              className="border-b border-white font-button text-[10px] uppercase tracking-widest"
            >
              Email Us
            </a>
          </div>
        </div>
      </section>

      {/* Wholesale Inquiry */}
      <section id="inquire" className="bg-primary px-5 py-16 text-on-primary md:px-32 md:py-32">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-16 md:flex-row">
          <div className="md:w-1/2">
            <h2 className="mb-6 font-['Newsreader'] text-headline-xl">Contact Us</h2>
          </div>
          <div className="w-full md:w-1/2">
            {submitted ? (
              <p className="font-['Newsreader'] text-xl italic text-primary-fixed">
                Thanks! We'll be in touch shortly.
              </p>
            ) : (
              <form onSubmit={handleInquiry} className="space-y-6">
                <div>
                  <label className="mb-2 block font-label-caps text-xs text-primary-fixed">
                    BUSINESS EMAIL
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@yourbusiness.com"
                    className="w-full border-b border-primary-fixed bg-transparent pb-2 text-white outline-none transition-colors placeholder:text-primary-fixed/50 focus:border-white focus:ring-0"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary-fixed py-4 font-button text-button text-on-primary-fixed transition-colors hover:bg-white"
                >
                  Send
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
