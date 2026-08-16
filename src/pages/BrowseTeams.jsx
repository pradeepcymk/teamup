import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import FriendlyState from '../components/FriendlyState'
import ShareTeamButtons from '../components/ShareTeamButtons'

function BrowseTeams() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const [search, setSearch] = useState('')
  const [projectType, setProjectType] = useState('')
  const [workMode, setWorkMode] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    async function loadTeams() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        await supabase.from('onboarding_progress').upsert({
          user_id: user.id,
          browsed_teams_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      }

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

  const filteredTeams = useMemo(() => {
    const searchText = search.trim().toLowerCase()

    const results = teams.filter((team) => {
      const searchableText = [
        team.title,
        team.event_name,
        team.description,
        ...(team.required_skills || []),
        ...(team.required_roles || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      const matchesSearch =
        !searchText || searchableText.includes(searchText)

      const matchesProjectType =
        !projectType || team.project_type === projectType

      const matchesWorkMode =
        !workMode || team.work_mode === workMode

      return (
        matchesSearch &&
        matchesProjectType &&
        matchesWorkMode
      )
    })

    return [...results].sort((firstTeam, secondTeam) => {
      if (sortBy === 'deadline') {
        if (!firstTeam.deadline) return 1
        if (!secondTeam.deadline) return -1

        return (
          new Date(firstTeam.deadline) -
          new Date(secondTeam.deadline)
        )
      }

      if (sortBy === 'available-spots') {
        const firstAvailable =
          firstTeam.maximum_members - firstTeam.current_members

        const secondAvailable =
          secondTeam.maximum_members - secondTeam.current_members

        return secondAvailable - firstAvailable
      }

      return (
        new Date(secondTeam.created_at) -
        new Date(firstTeam.created_at)
      )
    })
  }, [teams, search, projectType, workMode, sortBy])

  function clearFilters() {
    setSearch('')
    setProjectType('')
    setWorkMode('')
    setSortBy('newest')
  }

  const inputStyle =
    'rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-indigo-400'

  return (
    <main className="min-h-screen bg-slate-950 px-6 pb-16 pt-32 text-white md:px-12">
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="font-semibold text-indigo-400">
              Find committed builders
            </p>

            <h1 className="mt-2 text-4xl font-bold">
              Find your next teammate
            </h1>

            <p className="mt-4 max-w-2xl text-slate-400">
              Explore SRM hackathons and semester projects that need your skills and availability.
            </p>
          </div>

          {!loading && teams.length > 0 && (
            <Link to="/create-team" className="app-button bg-indigo-500 text-center hover:bg-indigo-400">
              Form a Team
            </Link>
          )}
        </div>

        <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_1fr]">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search title, skills, roles or events..."
              className={inputStyle}
            />

            <select
              value={projectType}
              onChange={(event) =>
                setProjectType(event.target.value)
              }
              className={inputStyle}
            >
              <option value="">All project types</option>
              <option value="Hackathon">Hackathon</option>
              <option value="College Project">
                College Project
              </option>
              <option value="Personal Project">
                Personal Project
              </option>
            </select>

            <select
              value={workMode}
              onChange={(event) =>
                setWorkMode(event.target.value)
              }
              className={inputStyle}
            >
              <option value="">All work modes</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
              <option value="Hybrid">Hybrid</option>
            </select>

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className={inputStyle}
            >
              <option value="newest">Newest first</option>
              <option value="deadline">Deadline soon</option>
              <option value="available-spots">
                Most available spots
              </option>
            </select>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4">
            <p className="text-sm text-slate-400">
              {filteredTeams.length}{' '}
              {filteredTeams.length === 1 ? 'team' : 'teams'} found
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-semibold text-indigo-400 hover:text-indigo-300"
            >
              Clear filters
            </button>
          </div>
        </div>

        {loading && (
          <div className="mt-10 grid gap-6 md:grid-cols-2" aria-label="Loading teams">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="surface-card rounded-2xl p-6">
                <div className="skeleton h-4 w-28 rounded-full" />
                <div className="skeleton mt-5 h-8 w-3/5 rounded-lg" />
                <div className="skeleton mt-5 h-4 w-full rounded" />
                <div className="skeleton mt-3 h-4 w-4/5 rounded" />
                <div className="mt-7 flex gap-2">
                  <div className="skeleton h-7 w-20 rounded-full" />
                  <div className="skeleton h-7 w-24 rounded-full" />
                </div>
                <div className="skeleton mt-8 h-12 w-full rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {errorMessage && <div className="mt-10"><FriendlyState icon="network" eyebrow="Connection problem" title="Teams could not load" description="We couldn’t reach ShipPact’s team service. Check your connection and try again." actionLabel="Try again" onAction={() => window.location.reload()} compact /></div>}

        {!loading &&
          !errorMessage &&
          teams.length === 0 && (
            <div className="surface-card mt-10 rounded-2xl px-6 py-9 text-center">
              <div className="empty-visual" aria-hidden="true">
                <svg viewBox="0 0 24 24" className="h-8 w-8 fill-none stroke-current" strokeWidth="1.6">
                  <path d="M16 18.5c0-2.2-1.8-4-4-4H7c-2.2 0-4 1.8-4 4M9.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM17 8v6m-3-3h6" strokeLinecap="round" />
                </svg>
              </div>
              <h2 className="mt-5 text-2xl font-bold">
                No open teams yet
              </h2>

              <p className="mt-3 text-slate-400">
                Be the first student to publish a team post.
              </p>

              <Link
                to="/create-team"
                className="app-button mt-6 bg-indigo-500 hover:bg-indigo-400"
              >
                Form a Team
              </Link>
            </div>
          )}

        {!loading &&
          !errorMessage &&
          teams.length > 0 &&
          filteredTeams.length === 0 && (
            <div className="surface-card mt-10 rounded-2xl px-6 py-9 text-center">
              <div className="empty-visual" aria-hidden="true">
                <svg viewBox="0 0 24 24" className="h-8 w-8 fill-none stroke-current" strokeWidth="1.6">
                  <circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5M8 10.5h5" strokeLinecap="round" />
                </svg>
              </div>
              <h2 className="mt-5 text-2xl font-bold">
                No matching teams
              </h2>

              <p className="mt-3 text-slate-400">
                Try changing your search or filters.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 rounded-xl bg-indigo-500 px-5 py-3 font-semibold hover:bg-indigo-400"
              >
                Clear Filters
              </button>
            </div>
          )}

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {filteredTeams.map((team) => (
            <article
              key={team.id}
              className="interactive-card flex flex-col rounded-2xl border border-slate-800 bg-slate-900 p-6"
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

              <div className="mt-6 flex flex-col gap-3 border-t border-slate-800 pt-5">
                <Link to={`/teams/${team.id}`} className="app-button bg-indigo-500 text-center hover:bg-indigo-400">View Team</Link>
                <ShareTeamButtons team={team} compact />
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default BrowseTeams
