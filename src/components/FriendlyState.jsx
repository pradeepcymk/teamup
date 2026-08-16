import { Link } from 'react-router-dom'

const icons = {
  empty: <path d="M16 18.5c0-2.2-1.8-4-4-4H7c-2.2 0-4 1.8-4 4M9.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM17 8v6m-3-3h6" />,
  message: <><path d="M20 15a3 3 0 0 1-3 3H9l-5 3v-3a3 3 0 0 1-2-3V7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v8Z" /><path d="M8 11h.01M12 11h.01M16 11h.01" /></>,
  expired: <><circle cx="12" cy="12" r="8" /><path d="M12 7v5l3 2" /></>,
  lock: <><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  network: <><path d="M5 12.5a10 10 0 0 1 14 0M8 16a6 6 0 0 1 8 0M11.5 19.5h1" /><path d="M4 4l16 16" /></>,
  missing: <><path d="M9.5 9a2.8 2.8 0 1 1 4.7 2c-1.4 1-2.2 1.6-2.2 3" /><path d="M12 18h.01" /><circle cx="12" cy="12" r="9" /></>,
}

function FriendlyState({ icon = 'empty', eyebrow, title, description, actionLabel, actionTo, onAction, secondaryLabel, secondaryTo, compact = false }) {
  const actionClass = 'app-button bg-indigo-500 text-white hover:bg-indigo-400'

  return (
    <div className={`surface-card rounded-3xl px-6 text-center ${compact ? 'py-9' : 'py-14 md:py-16'}`}>
      <div className="empty-visual" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="h-8 w-8 fill-none stroke-current" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          {icons[icon] || icons.empty}
        </svg>
      </div>
      {eyebrow && <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-indigo-300">{eyebrow}</p>}
      <h2 className="mt-3 text-2xl font-bold md:text-3xl">{title}</h2>
      {description && <p className="mx-auto mt-3 max-w-lg leading-7 text-slate-400">{description}</p>}
      {(actionLabel || secondaryLabel) && (
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          {actionTo ? <Link to={actionTo} className={actionClass}>{actionLabel}</Link> : actionLabel && <button type="button" onClick={onAction} className={actionClass}>{actionLabel}</button>}
          {secondaryTo && <Link to={secondaryTo} className="app-button border border-slate-700 text-slate-200 hover:border-indigo-400 hover:bg-indigo-500/10">{secondaryLabel}</Link>}
        </div>
      )}
    </div>
  )
}

export default FriendlyState
