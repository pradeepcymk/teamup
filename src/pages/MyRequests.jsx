import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function MyRequests() {
  const navigate = useNavigate()

  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [withdrawingId, setWithdrawingId] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const loadRequests = useCallback(async () => {
    setLoading(true)
    setErrorMessage('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      navigate('/login')
      return
    }

    const { data: requestRows, error: requestError } = await supabase
      .from('join_requests')
      .select('*')
      .eq('applicant_id', user.id)
      .order('created_at', { ascending: false })

    if (requestError) {
      setErrorMessage(requestError.message)
      setLoading(false)
      return
    }

    if (!requestRows || requestRows.length === 0) {
      setRequests([])
      setLoading(false)
      return
    }

    const postIds = requestRows.map((request) => request.post_id)

    const { data: teamPosts, error: postsError } = await supabase
      .from('team_posts')
      .select(
        'id, title, event_name, description, work_mode, status, current_members, maximum_members'
      )
      .in('id', postIds)

    if (postsError) {
      setErrorMessage(postsError.message)
      setLoading(false)
      return
    }

    const combinedRequests = requestRows.map((request) => ({
      ...request,
      team: teamPosts?.find(
        (team) => team.id === request.post_id
      ),
    }))

    setRequests(combinedRequests)
    setLoading(false)
  }, [navigate])

  useEffect(() => {
    loadRequests()
  }, [loadRequests])

  async function withdrawRequest(request) {
    const confirmed = window.confirm(
      `Withdraw your application for ${
        request.team?.title || 'this team'
      }?`
    )

    if (!confirmed) {
      return
    }

    setWithdrawingId(request.id)
    setErrorMessage('')
    setSuccessMessage('')

    const { error } = await supabase
      .from('join_requests')
      .delete()
      .eq('id', request.id)
      .eq('applicant_id', request.applicant_id)

    if (error) {
      setErrorMessage(error.message)
      setWithdrawingId(null)
      return
    }

    setSuccessMessage('Application withdrawn successfully.')
    setWithdrawingId(null)
    await loadRequests()
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading your requests...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 pb-16 pt-32 text-white md:px-12">
      <section className="mx-auto max-w-5xl">
        <p className="font-semibold text-indigo-400">
          Application dashboard
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          My requests
        </h1>

        <p className="mt-4 text-slate-400">
          Track the join requests you submitted to teams.
        </p>

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

        {!errorMessage && requests.length === 0 && (
          <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
            <h2 className="text-2xl font-bold">
              You haven’t applied to any teams
            </h2>

            <p className="mt-3 text-slate-400">
              Browse open teams and find a project that matches your skills.
            </p>

            <Link
              to="/teams"
              className="mt-6 inline-block rounded-xl bg-indigo-500 px-5 py-3 font-semibold hover:bg-indigo-400"
            >
              Browse Teams
            </Link>
          </div>
        )}

        <div className="mt-10 space-y-6">
          {requests.map((request) => (
            <article
              key={request.id}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8"
            >
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                <div>
                  <p className="text-sm font-semibold text-indigo-400">
                    {request.team?.event_name || 'Team application'}
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    {request.team?.title || 'Team unavailable'}
                  </h2>
                </div>

                <StatusBadge status={request.status} />
              </div>

              <div className="mt-6 rounded-xl bg-slate-950 p-5">
                <p className="text-sm text-slate-500">
                  Requested role
                </p>

                <p className="mt-1 font-semibold text-indigo-300">
                  {request.requested_role}
                </p>

                {request.message && (
                  <>
                    <p className="mt-5 text-sm text-slate-500">
                      Your message
                    </p>

                    <p className="mt-2 leading-7 text-slate-300">
                      {request.message}
                    </p>
                  </>
                )}
              </div>

              {request.status === 'accepted' && (
                <p className="mt-5 rounded-xl bg-green-500/10 p-4 text-green-400">
                  You are now a member of this team!
                </p>
              )}

              {request.status === 'rejected' && (
                <p className="mt-5 rounded-xl bg-red-500/10 p-4 text-red-400">
                  The creator did not accept this application.
                </p>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                {request.team && (
                  <Link
                    to={`/teams/${request.post_id}`}
                    className="rounded-xl bg-indigo-500 px-5 py-3 text-center font-semibold hover:bg-indigo-400"
                  >
                    View Team
                  </Link>
                )}

                {request.status === 'pending' && (
                  <button
                    type="button"
                    onClick={() => withdrawRequest(request)}
                    disabled={withdrawingId === request.id}
                    className="rounded-xl border border-red-500 px-5 py-3 font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                  >
                    {withdrawingId === request.id
                      ? 'Withdrawing...'
                      : 'Withdraw Request'}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

function StatusBadge({ status }) {
  const styles = {
    pending: 'bg-yellow-500/10 text-yellow-400',
    accepted: 'bg-green-500/10 text-green-400',
    rejected: 'bg-red-500/10 text-red-400',
  }

  return (
    <span
      className={`w-fit rounded-full px-3 py-1 text-sm font-semibold capitalize ${
        styles[status] || 'bg-slate-800 text-slate-300'
      }`}
    >
      {status}
    </span>
  )
}

export default MyRequests
