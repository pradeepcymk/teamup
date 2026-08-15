import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Applications() {
  const navigate = useNavigate()

  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const loadApplications = useCallback(async () => {
    setLoading(true)
    setErrorMessage('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      navigate('/login')
      return
    }

    // Get all team posts created by the current user
    const { data: posts, error: postsError } = await supabase
      .from('team_posts')
      .select(
        'id, title, event_name, status, current_members, maximum_members'
      )
      .eq('creator_id', user.id)

    if (postsError) {
      setErrorMessage(postsError.message)
      setLoading(false)
      return
    }

    if (!posts || posts.length === 0) {
      setApplications([])
      setLoading(false)
      return
    }

    const postIds = posts.map((post) => post.id)

    // Get applications submitted to those posts
    const { data: requests, error: requestsError } = await supabase
      .from('join_requests')
      .select('*')
      .in('post_id', postIds)
      .order('created_at', { ascending: false })

    if (requestsError) {
      setErrorMessage(requestsError.message)
      setLoading(false)
      return
    }

    if (!requests || requests.length === 0) {
      setApplications([])
      setLoading(false)
      return
    }

    const applicantIds = [
      ...new Set(requests.map((request) => request.applicant_id)),
    ]

    // Get the applicants' profile information
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select(
        'id, full_name, college, department, study_year, bio, skills, github_url, linkedin_url'
      )
      .in('id', applicantIds)

    if (profilesError) {
      setErrorMessage(profilesError.message)
      setLoading(false)
      return
    }

    const combinedApplications = requests.map((request) => ({
      ...request,
      team: posts.find((post) => post.id === request.post_id),
      applicant: profiles?.find(
        (profile) => profile.id === request.applicant_id
      ),
    }))

    setApplications(combinedApplications)
    setLoading(false)
  }, [navigate])

  useEffect(() => {
    loadApplications()
  }, [loadApplications])

  async function handleDecision(requestId, decision) {
    setProcessingId(requestId)
    setErrorMessage('')
    setSuccessMessage('')

    const functionName =
      decision === 'accepted'
        ? 'accept_join_request'
        : 'reject_join_request'

    const { error } = await supabase.rpc(functionName, {
      request_id: requestId,
    })

    if (error) {
      setErrorMessage(error.message)
      setProcessingId(null)
      return
    }

    setSuccessMessage(
      decision === 'accepted'
        ? 'Application accepted successfully!'
        : 'Application rejected.'
    )

    setProcessingId(null)
    await loadApplications()
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading applications...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 pb-16 pt-32 text-white md:px-12">
      <section className="mx-auto max-w-6xl">
        <p className="font-semibold text-indigo-400">
          Creator dashboard
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          Team applications
        </h1>

        <p className="mt-4 text-slate-400">
          Review students who have requested to join your teams.
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

        {!errorMessage && applications.length === 0 && (
          <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
            <h2 className="text-2xl font-bold">
              No applications yet
            </h2>

            <p className="mt-3 text-slate-400">
              Applications sent to your team posts will appear here.
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
          {applications.map((application) => (
            <article
              key={application.id}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8"
            >
              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
                <div>
                  <p className="text-sm font-semibold text-indigo-400">
                    Application for
                  </p>

                  <Link
                    to={`/teams/${application.post_id}`}
                    className="mt-1 block text-2xl font-bold hover:text-indigo-300"
                  >
                    {application.team?.title || 'Team post'}
                  </Link>

                  <p className="mt-2 text-sm text-slate-500">
                    {application.team?.event_name}
                  </p>
                </div>

                <StatusBadge status={application.status} />
              </div>

              <div className="mt-7 border-t border-slate-800 pt-7">
                <h2 className="text-xl font-bold">
                  {application.applicant?.full_name || 'Student'}
                </h2>

                <p className="mt-2 text-slate-400">
                  {[
                    application.applicant?.department,
                    application.applicant?.college,
                  ]
                    .filter(Boolean)
                    .join(' · ') || 'Student profile'}
                </p>

                {application.applicant?.study_year && (
                  <p className="mt-1 text-sm text-slate-500">
                    {application.applicant.study_year}
                  </p>
                )}

                <div className="mt-5 rounded-xl bg-slate-950 p-5">
                  <p className="text-sm text-slate-500">
                    Requested role
                  </p>

                  <p className="mt-1 font-semibold text-indigo-300">
                    {application.requested_role}
                  </p>

                  <p className="mt-5 text-sm text-slate-500">
                    Application message
                  </p>

                  <p className="mt-2 whitespace-pre-line leading-7 text-slate-300">
                    {application.message}
                  </p>
                </div>

                {application.applicant?.skills?.length > 0 && (
                  <div className="mt-5">
                    <p className="text-sm font-semibold text-slate-300">
                      Skills
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {application.applicant.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-5 flex flex-wrap gap-5">
                  {application.applicant?.github_url && (
                    <a
                      href={application.applicant.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-indigo-400 hover:text-indigo-300"
                    >
                      View GitHub
                    </a>
                  )}

                  {application.applicant?.linkedin_url && (
                    <a
                      href={application.applicant.linkedin_url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-indigo-400 hover:text-indigo-300"
                    >
                      View LinkedIn
                    </a>
                  )}
                </div>

                {application.status === 'pending' && (
                  <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() =>
                        handleDecision(application.id, 'accepted')
                      }
                      disabled={processingId === application.id}
                      className="rounded-xl bg-green-600 px-5 py-3 font-semibold hover:bg-green-500 disabled:opacity-50"
                    >
                      {processingId === application.id
                        ? 'Processing...'
                        : 'Accept'}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDecision(application.id, 'rejected')
                      }
                      disabled={processingId === application.id}
                      className="rounded-xl bg-red-600 px-5 py-3 font-semibold hover:bg-red-500 disabled:opacity-50"
                    >
                      {processingId === application.id
                        ? 'Processing...'
                        : 'Reject'}
                    </button>
                  </div>
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

export default Applications