import { useEffect } from 'react'

interface Props {
  title: string
  description: string
}

// Sets the document title and meta description per route. The site is a single
// HTML shell, so without this every page shares index.html's metadata.
export default function PageMeta({ title, description }: Props) {
  useEffect(() => {
    document.title = title
    let tag = document.querySelector('meta[name="description"]')
    if (!tag) {
      tag = document.createElement('meta')
      tag.setAttribute('name', 'description')
      document.head.appendChild(tag)
    }
    tag.setAttribute('content', description)
  }, [title, description])

  return null
}
