import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function BrowseTeams() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function loadTeams() {
      const { data, error } = await supabase
        .from('team_posts')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false })

      if (error) {
        setErrorMessage(error.message)
        setLoading(false)
        return
      }

      setTeams(data || [])
      setLoading(false)
    }

    loadTeams()
  }, [])

  return (
    <main className="min-h-screen bg-slate-950 px-6 pb-16 pt-32 text-white md:px-12">
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="font-semibold text-indigo-400">
              Find your people
            </p>

            <h1 className="mt-2 text-4xl font-bold">
              Browse open teams
            </h1>

            <p className="mt-4 max-w-2xl text-slate-400">
              Discover hackathons and student projects that need your skills.
            </p>
          </div>

          <Link
            to="/create-team"
            className="rounded-xl bg-indigo-500 px-5 py-3 text-center font-semibold hover:bg-indigo-400"
          >
            Create a Team
          </Link>
        </div>

        {loading && (
          <p className="mt-12 text-slate-400">
            Loading teams...
          </p>
        )}

        {errorMessage && (
          <p className="mt-12 rounded-xl bg-red-500/10 p-4 text-red-400">
            {errorMessage}
          </p>
        )}

        {!loading && !errorMessage && teams.length === 0 && (
          <div className="mt-12 rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
            <h2 className="text-2xl font-bold">
              No open teams yet
            </h2>

            <p className="mt-3 text-slate-400">
              Be the first student to publish a team post.
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
              className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900 p-6"
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

                <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400">
                  Open
                </span>
              </div>

              <p className="mt-4 flex-grow leading-7 text-slate-400">
                {team.description}
              </p>

              <div className="mt-5">
                <p className="text-sm font-semibold text-slate-300">
                  Skills needed
                </p>

                <div className="mt-2 flex flex-wrap gap-2">
                  {(team.required_skills || []).map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <p className="text-sm font-semibold text-slate-300">
                  Roles needed
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  {(team.required_roles || []).join(', ')}
                </p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-slate-400">
                <p>
                  Members:{' '}
                  <span className="text-white">
                    {team.current_members}/{team.maximum_members}
                  </span>
                </p>

                <p>
                  Mode:{' '}
                  <span className="text-white">
                    {team.work_mode}
                  </span>
                </p>

                <p>
                  Type:{' '}
                  <span className="text-white">
                    {team.project_type}
                  </span>
                </p>

                <p>
                  Deadline:{' '}
                  <span className="text-white">
                    {team.deadline
                      ? new Date(
                          `${team.deadline}T00:00:00`
                        ).toLocaleDateString()
                      : 'Not specified'}
                  </span>
                </p>
              </div>

              <Link
                to={`/teams/${team.id}`}
                className="mt-6 rounded-lg bg-indigo-500 px-4 py-2 text-center font-semibold hover:bg-indigo-400"
              >
                View Team
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default BrowseTeams