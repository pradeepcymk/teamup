import { lifecycleLabels } from '../lib/teamLifecycle'

const lifecycleStyles = {
  recruiting: 'bg-green-500/10 text-green-400',
  team_formed: 'bg-blue-500/10 text-blue-300',
  building: 'bg-amber-500/10 text-amber-300',
  completed: 'bg-indigo-500/10 text-indigo-300',
}

function TeamLifecycleBadge({ stage = 'recruiting' }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${lifecycleStyles[stage] || lifecycleStyles.recruiting}`}>
      {lifecycleLabels[stage] || lifecycleLabels.recruiting}
    </span>
  )
}

export default TeamLifecycleBadge
