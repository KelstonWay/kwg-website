import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// One place that owns <title> and the meta description for every route. The site is a
// single HTML shell, so without this every page keeps index.html's metadata — and a
// per-page approach left order/account routes wearing whichever page the buyer came from
// (Codex review, 2026-08-02).

const DEFAULT_META = {
  title: 'Kelston Way Greenhouse — Wholesale Plant Grower in Central Texas',
  description:
    'Kelston Way is a family-owned wholesale greenhouse in the Waco, Texas area, growing annuals, perennials, and seasonal color.',
}

// Exact paths first, then prefixes for the routes that carry an :id.
const EXACT: Record<string, { title: string; description: string }> = {
  '/': DEFAULT_META,
  '/availability': {
    title: 'Current Wholesale Availability — Kelston Way Greenhouse',
    description:
      "This week's wholesale availability from Kelston Way Greenhouse in the Waco, Texas area, with annuals, perennials, and seasonal color.",
  },
  '/fundraisers': {
    title: 'Fundraisers | Kelston Way Greenhouse',
    description:
      'Flower fundraisers for schools in the Waco area. We grow the flowers, your school sells them, and we deliver to you.',
  },
  '/team': {
    title: 'Meet the Team — Kelston Way Greenhouse | Wholesale Grower, Waco, Texas Area',
    description:
      'Meet the family behind Kelston Way Greenhouse, a family-owned wholesale greenhouse in the Waco, Texas area.',
  },
  '/contact': {
    title: 'Contact — Kelston Way Greenhouse | Wholesale Grower, Waco, Texas Area',
    description:
      'Contact the Kelston Way Greenhouse team about wholesale availability, orders, standing orders, or growing programs.',
  },
  '/order': {
    title: 'Review Your Order — Kelston Way Greenhouse',
    description: 'Review and send your wholesale order to Kelston Way Greenhouse.',
  },
  '/order/confirmed': {
    title: 'Order Received — Kelston Way Greenhouse',
    description: 'Your wholesale order has been received by Kelston Way Greenhouse.',
  },
  '/account': {
    title: 'Your Account — Kelston Way Greenhouse',
    description: 'Sign in to see your Kelston Way order history and reorder.',
  },
}

const PREFIX: Array<[string, { title: string; description: string }]> = [
  [
    '/account/order/',
    {
      title: 'Order Detail — Kelston Way Greenhouse',
      description: 'Details for one of your Kelston Way wholesale orders.',
    },
  ],
  [
    '/order/',
    {
      title: 'Your Order — Kelston Way Greenhouse',
      description: 'Track or confirm your Kelston Way wholesale order.',
    },
  ],
]

function metaFor(pathname: string) {
  const exact = EXACT[pathname]
  if (exact) return exact
  const prefix = PREFIX.find(([p]) => pathname.startsWith(p))
  return prefix ? prefix[1] : DEFAULT_META
}

export default function RouteMeta() {
  const { pathname } = useLocation()

  useEffect(() => {
    const { title, description } = metaFor(pathname)
    document.title = title
    let tag = document.querySelector('meta[name="description"]')
    if (!tag) {
      tag = document.createElement('meta')
      tag.setAttribute('name', 'description')
      document.head.appendChild(tag)
    }
    tag.setAttribute('content', description)
  }, [pathname])

  return null
}
