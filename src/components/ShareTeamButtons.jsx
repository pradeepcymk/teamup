import { useEffect, useState } from 'react'

function ShareTeamButtons({ team, compact = false }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return undefined
    const timeout = window.setTimeout(() => setCopied(false), 2200)
    return () => window.clearTimeout(timeout)
  }, [copied])

  const teamUrl = `${window.location.origin}/teams/${team.id}`
  const roles = (team.required_roles || []).join(', ')
  const shareText = [
    `🚀 ${team.title}`,
    team.event_name ? `Event: ${team.event_name}` : '',
    roles ? `Looking for: ${roles}` : '',
    'Join this team on ShipPact:',
    teamUrl,
  ].filter(Boolean).join('\n')

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(teamUrl)
    } catch {
      const input = document.createElement('textarea')
      input.value = teamUrl
      input.style.position = 'fixed'
      input.style.opacity = '0'
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      input.remove()
    }
    setCopied(true)
  }

  return (
    <div className={`flex flex-wrap gap-2 ${compact ? '' : 'mt-4'}`}>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
        target="_blank"
        rel="noreferrer"
        aria-label={`Share ${team.title} on WhatsApp`}
        className={`${compact ? 'min-h-10 px-3 text-sm' : 'min-h-11 px-4'} inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-500/10 font-semibold text-emerald-300 hover:border-emerald-400/50 hover:bg-emerald-500/15`}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8" aria-hidden="true">
          <path d="M20 11.6a8 8 0 0 1-11.8 7L4 20l1.4-4A8 8 0 1 1 20 11.6Z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 8.2c.3-.6.6-.6.9-.6h.4c.2 0 .4.1.5.4l.8 1.9c.1.3 0 .5-.2.7l-.6.7c.8 1.7 2 2.7 3.7 3.4l.6-.8c.2-.3.5-.3.8-.2l1.8.9c.3.2.4.4.3.7-.2 1.1-1.2 1.8-2.3 1.8-3.8 0-8.8-4.4-8.8-8 0-.4.1-.7.3-.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        WhatsApp
      </a>
      <button
        type="button"
        onClick={copyLink}
        className={`${compact ? 'min-h-10 px-3 text-sm' : 'min-h-11 px-4'} inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 font-semibold text-slate-300 hover:border-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-200`}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8" aria-hidden="true"><path d="M9.5 14.5 14.5 9M7.4 16.6l-1.1 1.1a3.5 3.5 0 0 1-5-5l3.4-3.4a3.5 3.5 0 0 1 5 0M16.6 7.4l1.1-1.1a3.5 3.5 0 1 1 5 5l-3.4 3.4a3.5 3.5 0 0 1-5 0" strokeLinecap="round" strokeLinejoin="round" /></svg>
        {copied ? 'Link copied!' : 'Copy link'}
      </button>
    </div>
  )
}

export default ShareTeamButtons
