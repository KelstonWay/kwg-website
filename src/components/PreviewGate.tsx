import { useState, type ReactNode } from 'react'

// Preview-only password wall. Active ONLY when VITE_PREVIEW_PASSWORD is set at build
// time, which is done for preview deployments and never for production — so this
// disappears entirely from a prod build. It keeps the paused site from being read by
// anyone who stumbles on the preview URL; it is not a security boundary, and the data
// behind it is the same live Supabase project.
const PASSWORD = import.meta.env.VITE_PREVIEW_PASSWORD as string | undefined
const KEY = 'kwg_preview_ok'

export default function PreviewGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(() => !PASSWORD || sessionStorage.getItem(KEY) === '1')
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)

  if (unlocked) return <>{children}</>

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (value === PASSWORD) {
      sessionStorage.setItem(KEY, '1')
      setUnlocked(true)
      return
    }
    setError(true)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-6">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-sm border border-outline-variant/30 bg-white p-8 text-center"
      >
        <img src="/logo-cropped.png" alt="Kelston Way" className="mx-auto mb-6 h-14 w-auto" />
        <h1 className="mb-2 font-['Newsreader'] text-2xl text-on-surface">Private preview</h1>
        <p className="mb-6 font-body-md text-sm text-on-surface-variant">
          This site isn't public yet. Enter the password to take a look.
        </p>
        <input
          type="password"
          autoFocus
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setError(false)
          }}
          placeholder="Password"
          aria-label="Preview password"
          className="mb-3 w-full rounded border border-outline-variant px-4 py-3 text-center font-body-md focus:border-primary focus:outline-none"
        />
        {error && (
          <p className="mb-3 font-body-md text-sm text-error">That's not it — try again.</p>
        )}
        <button
          type="submit"
          className="w-full rounded-sm bg-primary py-3 font-button text-button text-on-primary transition-all hover:bg-primary-container"
        >
          View the site
        </button>
      </form>
    </div>
  )
}
