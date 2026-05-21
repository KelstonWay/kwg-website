interface Props {
  message: string
  className?: string
}

export default function ErrorBanner({ message, className = '' }: Props) {
  return (
    <div
      className={`flex items-start gap-2.5 rounded border border-error/20 bg-error-container px-4 py-3 ${className}`}
    >
      <span className="material-symbols-outlined mt-px flex-shrink-0 text-[18px] text-error">
        error
      </span>
      <p className="font-body-md text-sm text-on-error-container">{message}</p>
    </div>
  )
}
