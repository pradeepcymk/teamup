import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import TeamLifecycleBadge from '../components/TeamLifecycleBadge'
import { lifecycleLabels, lifecycleStages } from '../lib/teamLifecycle'

function MyTeams() {
  const navigate = useNavigate()

  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const loadTeams = useCallback(async () => {
    setLoading(true)
    setErrorMessage('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      navigate('/login')
      return
    }

    const { data, error } = await supabase
      .from('team_posts')
      .select('*')
      .eq('creator_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      setErrorMessage(error.message)
      setLoading(false)
      return
    }

    setTeams(data || [])
    setLoading(false)
  }, [navigate])

  useEffect(() => {
    loadTeams()
  }, [loadTeams])

  async function updateLifecycle(team, lifecycleStage) {
    setErrorMessage('')
    setSuccessMessage('')

    if (
      lifecycleStage === 'recruiting' &&
      team.current_members >= team.maximum_members
    ) {
      setErrorMessage(
        'This team is full. Increase its maximum members before recruiting again.'
      )
      return
    }

    const confirmed = window.confirm(
      `Move this team to “${lifecycleLabels[lifecycleStage]}”?`
    )

    if (!confirmed) {
      return
    }

    setProcessingId(team.id)

    const { error } = await supabase
      .from('team_posts')
      .update({
        lifecycle_stage: lifecycleStage,
        status: lifecycleStage === 'recruiting' ? 'open' : 'closed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', team.id)

    if (error) {
      setErrorMessage(error.message)
      setProcessingId(null)
      return
    }

    setSuccessMessage(`Team moved to ${lifecycleLabels[lifecycleStage]}.`)

    setProcessingId(null)
    await loadTeams()
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading your teams...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 pb-16 pt-32 text-white md:px-12">
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="font-semibold text-indigo-400">
              Creator dashboard
            </p>

            <h1 className="mt-2 text-4xl font-bold">
              My teams
            </h1>

            <p className="mt-4 text-slate-400">
              Manage the teams and projects you created.
            </p>
          </div>

          <Link
            to="/create-team"
            className="rounded-xl bg-indigo-500 px-5 py-3 text-center font-semibold hover:bg-indigo-400"
          >
            Create New Team
          </Link>
        </div>

        {errorMessage && (
          <p className="mt-8 rounded-xl bg-red-500/10 p-4 text-red-400">
            {errorMessage}
          </p>
        )}

        {successMessage && (
          <p className="mt-8 rounded-xl bg-green-500/10 p-4 text-green-400">
            {successMessage}
          </p>
        )}

        {!errorMessage && teams.length === 0 && (
          <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
            <h2 className="text-2xl font-bold">
              You haven’t created a team yet
            </h2>

            <p className="mt-3 text-slate-400">
              Create your first team post to start finding teammates.
            </p>

            <Link
              to="/create-team"
              className="mt-6 inline-block rounded-xl bg-indigo-500 px-5 py-3 font-semibold hover:bg-indigo-400"
            >
              Create a Team
            </Link>
          </div>
        )}

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {teams.map((team) => (
            <article
              key={team.id}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-indigo-400">
                    {team.event_name}
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    {team.title}
                  </h2>
                </div>

                <TeamLifecycleBadge stage={team.lifecycle_stage} />
              </div>

              <p className="mt-4 line-clamp-3 leading-7 text-slate-400">
                {team.description}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Members</p>
                  <p className="mt-1 font-semibold">
                    {team.current_members}/{team.maximum_members}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500">Work mode</p>
                  <p className="mt-1 font-semibold">
                    {team.work_mode}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500">Project type</p>
                  <p className="mt-1 font-semibold">
                    {team.project_type}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500">Deadline</p>
                  <p className="mt-1 font-semibold">
                    {team.deadline
                      ? new Date(
                          `${team.deadline}T00:00:00`
                        ).toLocaleDateString()
                      : 'Not specified'}
                  </p>
                </div>
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  to={`/teams/${team.id}`}
                  className="rounded-xl bg-indigo-500 px-4 py-3 text-center font-semibold hover:bg-indigo-400"
                >
                  View Team
                </Link>

                <Link
                  to={`/teams/${team.id}/edit`}
                  className="rounded-xl border border-slate-600 px-4 py-3 text-center font-semibold hover:border-indigo-400"
                >
                  Edit Team
                </Link>

              </div>

              <div className="mt-6 border-t border-slate-800 pt-5">
                <label htmlFor={`lifecycle-${team.id}`} className="text-sm font-semibold text-slate-300">
                  Project stage
                </label>
                <select
                  id={`lifecycle-${team.id}`}
                  value={team.lifecycle_stage || 'recruiting'}
                  onChange={(event) => updateLifecycle(team, event.target.value)}
                  disabled={processingId === team.id}
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-400 disabled:opacity-50"
                >
                  {lifecycleStages.map((stage) => (
                    <option key={stage} value={stage}>{lifecycleLabels[stage]}</option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-slate-500">
                  Only Recruiting teams appear in Find Teammates and accept applications.
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default MyTeams
