export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <svg viewBox="0 0 32 32" className="size-7 shrink-0" aria-hidden>
        <rect width="32" height="32" rx="8" fill="var(--color-primary)" />
        <rect x="7" y="10" width="18" height="12" rx="2.5" fill="none" stroke="#fff" strokeWidth="2" />
        <path d="M7 14h18" stroke="#fff" strokeWidth="2" />
      </svg>
      <span className="flex flex-col">
        <span className="text-body-sm font-semibold text-ink">Mayar Card</span>
        <span className="text-caption-sm text-muted">Design system v2</span>
      </span>
    </span>
  )
}
