import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { AvailabilityItem } from '../lib/types'

const HERO_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCU5GXq9zQJd9jZY0p5Pw_pdYWukWOYpQvbx_LXEE4ulEJlCnoCFjFNumRTjftz0z4sS6UsQS41bStGCAifaBIutkDA00bu2OhSDCBLNosxQ-k4Z3mlyJJU7p_xLFZ6RbJStb1asxE_-2t-hAp8xKKeAI8jz1hir0oCZH7opGG5TOlEOMe2_fLHMWOOakr6kazSZzOknKZiOm3Nz57cUg_5l2Lqm0dkLPHEqY0vGFy39xR4BYsspuzt6sc7g8itnCn7HblxiVWOfMeu'
const HERO_IMG2 = 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5rJsZj0scz82NMzLEm537jY04HMnkNlyow837bCOw-e0I3XV-FktA9aTHBQZEISRG5ehc7bL1EfNkYMAJHjZkm07vERbl8jgZuPfiSpAA31rv-C8QmT3LaERyampqUO6CznKalSlLHGApYki_4EL4Dj_qiYNCZRP67Cb_4qQfZD3O3PEPt56FzhfOFZMlTkrLuiGgwhfQ1I9MNxz_1LGa-GsK5jWZiyQ2iHcXijDbKr5mvzMtwIX-LX8QiNOuBvr6IhxpFLVhZG_1'
const BENTO_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDbYPDSXshUOu9E_hnQV5Z4_7LkjpIZcLe8fY90esgAr2IY_28Yy0z7pKsd9WmnY04Gj1HMD0nPt8QluMp8FhTkeB0p0kG1F8U-S0qGUmWouffHDXXmjQ2Ua4LyS-0vVPGiJAmkLnqLvAyb2ST1n510dkeH2rzm_3HJrkK3LJEXypc69hE25r4aOo404JVxMKkNTx6KbMi_LzNgIRWrI6ERgEp9tbg7kHBlz_mF5e0u7yN6QxlgE8pG3bagvE_BUSPOUYqcKIUsaOgo'
const BENTO_IMG2 = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwql5SlXI1Bl5XhtGUgOJtqJxcfH8FMhRqlV1vtmCLrqmHsQFwqxEZXwz2kpV5mtJqHESLDDVb00XpKC4-zAsnt1c6JqgDPU8nNrd9MxcenUwA6RZU9GNNO2RY3glxFSC-qyUegSqpTJxPeiDX-XJrSXSVt5oC8Rsdpf8QzKwzB-iR8xxSb9NEg7lXAWaB0k63pjjjyPZmUtHh9lU4DlYzut59U4dLXzXjfmic5ZLjbuNBRX1I-4UfxlUg-k8Bmhno160Blg6b6Fyx'


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
    const resendKey = import.meta.env.VITE_RESEND_API_KEY
    const samuelEmail = import.meta.env.VITE_SAMUEL_EMAIL
    if (!resendKey) { setSubmitted(true); return }
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'orders@kelstonway.com',
        to: samuelEmail,
        subject: `Wholesale Access Request — ${email}`,
        html: `<p>New wholesale inquiry from: <strong>${email}</strong></p>`,
      }),
    })
    setSubmitted(true)
    setEmail('')
  }

  return (
    <>
      {/* Hero */}
      <section className="px-8 md:px-32 py-20 flex flex-col md:grid md:grid-cols-12 gap-16 items-center overflow-hidden">
        <div className="md:col-span-6 z-10">
          <span className="font-label-caps text-label-caps text-secondary mb-4 block">PREMIUM B2B NURSERY SOLUTIONS</span>
          <h1 className="font-['Newsreader'] text-display-lg text-on-surface mb-8">
            Elevating <span className="italic text-primary">Commercial Landscapes</span> through horticultural excellence.
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg mb-10 leading-relaxed">
            Kelston Way provides garden centers and landscape professionals with a curated supply of rare cultivars and resilient Hill Country species at scale.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link to="/availability" className="px-8 py-4 bg-primary text-on-primary font-button text-button rounded-sm hover:bg-primary-container transition-all duration-300">
              View Catalog
            </Link>
            <a href="#inquire" className="px-8 py-4 border border-secondary text-secondary font-button text-button rounded-sm hover:bg-secondary-container/20 transition-all duration-300">
              Inquire for Wholesale
            </a>
          </div>
        </div>
        <div className="md:col-span-6 relative h-[600px] w-full">
          <div className="absolute top-0 right-0 w-3/4 h-[400px] shape-arch overflow-hidden border border-outline-variant/20 shadow-sm">
            <img src={HERO_IMG} alt="Commercial greenhouse interior" className="w-full h-full object-cover" />
          </div>
          <div className="absolute bottom-0 left-0 w-1/2 h-[300px] shape-pill overflow-hidden border border-outline-variant/20 shadow-sm z-20">
            <img src={HERO_IMG2} alt="Palletized nursery shipment" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="px-8 md:px-32 py-24 bg-stone-100">
        <div className="max-w-4xl mb-16">
          <span className="font-label-caps text-label-caps text-secondary mb-4 block">PROFESSIONAL SERVICES</span>
          <h2 className="font-['Newsreader'] text-headline-xl text-on-surface">Built for Professionals</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { icon: 'inventory_2', title: 'Live Inventory', body: 'Access our real-time availability lists. We specialize in consistent, high-quality supply of rare aroids and drought-tolerant Hill Country species.' },
            { icon: 'local_shipping', title: 'Wholesale Delivery', body: 'Our logistics network ensures safe, climate-controlled delivery for large-scale orders across the Southwest, maintaining plant health from our soil to your floor.' },
            { icon: 'design_services', title: 'Custom Curations', body: 'Partner with our horticulturists to curate specific plant lists for hospitality, corporate environments, or high-end garden center features.' },
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
        <section className="px-8 md:px-32 py-16">
          <div className="flex justify-between items-center mb-8">
            <div>
              <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest block mb-1">Weekly Live Inventory</span>
              <h2 className="font-['Newsreader'] text-headline-xl text-on-surface">Available for Immediate Load</h2>
            </div>
            <Link to="/availability" className="font-button text-button text-primary flex items-center gap-2 group flex-shrink-0 ml-8">
              Full Catalog <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {preview.map((item) => (
              <div key={item.id} className="group cursor-pointer">
                <div className="aspect-[4/3] overflow-hidden shape-card border border-outline-variant/10 mb-4 bg-white transition-transform duration-500 group-hover:-translate-y-1">
                  <img
                    src={item.photo_url ?? HERO_IMG}
                    alt={item.plant_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex justify-between items-center px-1">
                  <div>
                    <h3 className="font-['Newsreader'] italic text-base text-on-surface group-hover:text-primary transition-colors">{item.plant_name}</h3>
                    <p className="font-body-md text-stone-500 text-sm">{item.qty_available} available</p>
                  </div>
                  {item.unit_price && (
                    <span className="font-label-caps text-xs text-on-secondary-fixed-variant bg-secondary-fixed px-2 py-1 rounded-full flex-shrink-0">${item.unit_price.toFixed(2)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Bento */}
      <section className="px-8 md:px-32 py-20 bg-stone-50">
        <div className="text-center mb-20 max-w-2xl mx-auto">
          <span className="font-label-caps text-label-caps text-secondary mb-4 block">OUR FACILITY</span>
          <h2 className="font-['Newsreader'] text-headline-xl mb-6">Nursery Operations</h2>
          <div className="w-12 h-[1px] bg-secondary mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-8 h-auto md:h-[800px]">
          <div className="md:col-span-2 md:row-span-2 relative group overflow-hidden bg-stone-100 rounded-sm">
            <img src={BENTO_IMG} alt="Commercial greenhouse scale" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-10 left-10 text-white">
              <span className="font-label-caps text-xs uppercase mb-2 block text-stone-200">Scale &amp; Resilience</span>
              <h3 className="font-['Newsreader'] text-4xl mb-4">Commercial Capacity</h3>
              <Link to="/our-story" className="px-6 py-2 border border-white/50 hover:bg-white hover:text-primary transition-all duration-300 font-button text-button inline-block">
                Our Story
              </Link>
            </div>
          </div>
          <div className="md:col-span-2 md:row-span-1 relative group overflow-hidden rounded-sm">
            <img src={BENTO_IMG2} alt="Quality control" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 glass-panel opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="text-center p-8">
                <h3 className="font-['Newsreader'] text-on-surface mb-2 text-2xl">Professional Standards</h3>
                <p className="font-body-md text-on-surface-variant mb-6">Rigorous quality control for commercial-grade stock.</p>
              </div>
            </div>
            <div className="absolute bottom-6 left-6 group-hover:opacity-0 transition-opacity">
              <h3 className="font-['Newsreader'] text-2xl text-white drop-shadow-md">Professional Standards</h3>
            </div>
          </div>
          <div className="md:col-span-1 md:row-span-1 bg-secondary-container flex flex-col items-center justify-center p-6 text-center rounded-sm">
            <span className="material-symbols-outlined text-3xl mb-3 text-secondary">local_shipping</span>
            <h3 className="font-['Newsreader'] text-lg text-on-secondary-container mb-2">Statewide Shipping</h3>
            <p className="font-body-md text-xs text-on-secondary-fixed-variant mb-4">Commercial routes across Texas and the Southwest.</p>
          </div>
          <div className="md:col-span-1 md:row-span-1 bg-primary flex flex-col items-center justify-center p-6 text-center text-on-primary rounded-sm">
            <span className="material-symbols-outlined text-3xl mb-3">handshake</span>
            <h3 className="font-['Newsreader'] text-lg mb-2">Partnership</h3>
            <p className="font-body-md text-xs opacity-90 mb-4">Open a wholesale account for exclusive pricing.</p>
            <a href="#inquire" className="font-button text-[10px] uppercase tracking-widest border-b border-white">Apply Now</a>
          </div>
        </div>
      </section>

      {/* Wholesale Inquiry */}
      <section id="inquire" className="px-8 md:px-32 py-32 bg-primary text-on-primary">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="md:w-1/2">
            <h2 className="font-['Newsreader'] text-headline-xl mb-6">Request Wholesale <span className="italic opacity-80">Access</span></h2>
            <p className="font-body-lg text-lg opacity-90 leading-relaxed">
              Sign up for wholesale access to real-time inventory, bulk pricing, and logistics scheduling for your garden center or project.
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
