import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Onboarding() {
  const navigate = useNavigate()
  const [steps, setSteps] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function loadOnboarding() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        navigate('/login')
        return
      }

      const [profileResult, contactResult, progressResult, teamsResult, requestsResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('bio, skills, availability, github_url, linkedin_url')
          .eq('id', user.id)
          .maybeSingle(),
        supabase
          .from('private_contacts')
          .select('contact_value')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('onboarding_progress')
          .select('browsed_teams_at')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('team_posts')
          .select('id', { count: 'exact', head: true })
          .eq('creator_id', user.id),
        supabase
          .from('join_requests')
          .select('id', { count: 'exact', head: true })
          .eq('applicant_id', user.id),
      ])

      const firstError = [profileResult, contactResult, progressResult, teamsResult, requestsResult]
        .find((result) => result.error)?.error

      if (firstError) {
        setErrorMessage(firstError.message)
        setLoading(false)
        return
      }

      const profile = profileResult.data
      const contact = contactResult.data
      const profileComplete = Boolean(
        profile?.skills?.length > 0 &&
        profile?.availability &&
        profile?.bio?.trim() &&
        (profile?.github_url || profile?.linkedin_url) &&
        contact?.contact_value?.trim()
      )
      const hasAppliedOrFormed = (teamsResult.count || 0) > 0 || (requestsResult.count || 0) > 0

      setSteps([
        {
          title: 'Confirm your email',
          description: 'Use the confirmation link Supabase sent to your inbox.',
          complete: Boolean(user.email_confirmed_at || user.confirmed_at),
        },
        {
          title: 'Complete your profile',
          description: 'Add skills, availability, proof of work, private contact and a short bio.',
          complete: profileComplete,
          action: '/profile',
          actionLabel: 'Complete profile',
        },
        {
          title: 'Browse teams',
          description: 'Explore recruiting teams and see which roles match your skills.',
          complete: Boolean(progressResult.data?.browsed_teams_at),
          action: '/teams',
          actionLabel: 'Browse teams',
        },
        {
          title: 'Apply or form a team',
          description: 'Request a role in an existing team or publish your own team listing.',
          complete: hasAppliedOrFormed,
          action: '/teams',
          actionLabel: 'Find a team',
          secondaryAction: '/create-team',
          secondaryLabel: 'Form a team',
        },
      ])
      setLoading(false)
    }

    loadOnboarding()
  }, [navigate])

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        Preparing your checklist...
      </main>
    )
  }

  const completedSteps = steps.filter((step) => step.complete).length
  const percentage = Math.round((completedSteps / steps.length) * 100)

  return (
    <main className="min-h-screen bg-slate-950 px-6 pb-16 pt-32 text-white md:px-12">
      <section className="mx-auto max-w-3xl">
        <p className="font-semibold text-indigo-400">Getting started</p>
        <h1 className="mt-2 text-4xl font-bold">Build your ShipPact profile</h1>
        <p className="mt-4 text-slate-400">
          Finish these steps to start finding committed teammates.
        </p>

        {errorMessage && (
          <p className="mt-8 rounded-xl bg-red-500/10 p-4 text-red-400">{errorMessage}</p>
        )}

        {!errorMessage && (
          <>
            <div className="mt-8 rounded-2xl border border-indigo-400/20 bg-indigo-500/5 p-6">
              <div className="flex items-center justify-between gap-4">
                <p className="font-semibold">{completedSteps} of {steps.length} steps complete</p>
                <span className="text-2xl font-bold text-indigo-300">{percentage}%</span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${percentage}%` }} />
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {steps.map((step, index) => (
                <article key={step.title} className={`rounded-2xl border p-6 ${step.complete ? 'border-green-500/20 bg-green-500/5' : 'border-slate-800 bg-slate-900'}`}>
                  <div className="flex items-start gap-4">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold ${step.complete ? 'bg-green-500/15 text-green-400' : 'bg-slate-800 text-slate-300'}`}>
                      {step.complete ? '✓' : index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg font-bold">{step.title}</h2>
                      <p className="mt-2 leading-6 text-slate-400">{step.description}</p>
                      {!step.complete && step.action && (
                        <div className="mt-4 flex flex-wrap gap-3">
                          <Link to={step.action} className="rounded-xl bg-indigo-500 px-4 py-2.5 font-semibold hover:bg-indigo-400">
                            {step.actionLabel}
                          </Link>
                          {step.secondaryAction && (
                            <Link to={step.secondaryAction} className="rounded-xl border border-slate-600 px-4 py-2.5 font-semibold hover:border-indigo-400">
                              {step.secondaryLabel}
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {percentage === 100 && (
              <div className="mt-8 rounded-2xl border border-green-500/20 bg-green-500/10 p-6 text-center">
                <h2 className="text-2xl font-bold text-green-400">You’re ready to build.</h2>
                <p className="mt-2 text-slate-300">Your ShipPact onboarding is complete.</p>
                <Link to="/teams" className="mt-5 inline-block rounded-xl bg-indigo-500 px-5 py-3 font-semibold hover:bg-indigo-400">
                  Find teammates
                </Link>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  )
}

export default Onboarding
