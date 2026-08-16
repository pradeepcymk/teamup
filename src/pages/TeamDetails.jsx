import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import SrmVerifiedBadge from '../components/SrmVerifiedBadge'
import TeamLifecycleBadge from '../components/TeamLifecycleBadge'
import FriendlyState from '../components/FriendlyState'

function TeamDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [team, setTeam] = useState(null)
  const [creator, setCreator] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [teamMembers, setTeamMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [loadErrorType, setLoadErrorType] = useState('')
  const [showReportForm, setShowReportForm] = useState(false)
  const [reportReason, setReportReason] = useState('misleading')
  const [reportDetails, setReportDetails] = useState('')
  const [reporting, setReporting] = useState(false)
  const [reportMessage, setReportMessage] = useState('')
  const [showApplicationForm, setShowApplicationForm] = useState(false)
const [requestedRole, setRequestedRole] = useState('')
const [applicationMessage, setApplicationMessage] = useState('')
const [existingRequest, setExistingRequest] = useState(null)
const [submitting, setSubmitting] = useState(false)
const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    async function loadTeam() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      setCurrentUser(user)

      const { data: teamData, error: teamError } = await supabase
        .from('team_posts')
        .select('*')
        .eq('id', id)
        .single()

      if (teamError) {
        setLoadErrorType(teamError.code === 'PGRST116' ? 'missing' : 'network')
        setErrorMessage(teamError.message)
        setLoading(false)
        return
      }

      setTeam(teamData)
      if (user && user.id !== teamData.creator_id) {
  const { data: requestData, error: requestError } = await supabase
    .from('join_requests')
    .select('*')
    .eq('post_id', teamData.id)
    .eq('applicant_id', user.id)
    .maybeSingle()

  if (requestError) {
    setErrorMessage(requestError.message)
    setLoading(false)
    return
  }

  setExistingRequest(requestData)
}

      const { data: creatorData, error: creatorError } = await supabase
        .from('profiles')
        .select(
          'full_name, college, department, study_year, bio, skills, github_url, linkedin_url, is_srm_verified'
        )
        .eq('id', teamData.creator_id)
        .single()

      if (creatorError) {
        setErrorMessage(creatorError.message)
        setLoading(false)
        return
      }

      setCreator(creatorData)

const { data: memberRows, error: membersError } = await supabase
  .from('team_members')
  .select('*')
  .eq('post_id', teamData.id)
  .order('joined_at', { ascending: true })

if (membersError) {
  setErrorMessage(membersError.message)
  setLoading(false)
  return
}

const memberIds = (memberRows || []).map(
  (member) => member.user_id
)

let memberProfiles = []
let memberContacts = []

if (memberIds.length > 0) {
  const { data: profilesData, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name, department, study_year, skills, is_srm_verified')
    .in('id', memberIds)

  if (profilesError) {
    setErrorMessage(profilesError.message)
    setLoading(false)
    return
  }

  memberProfiles = profilesData || []

  const { data: contactsData, error: contactsError } = await supabase
    .from('private_contacts')
    .select('user_id, contact_type, contact_value')
    .in('user_id', memberIds)

  if (contactsError) {
    setErrorMessage(contactsError.message)
    setLoading(false)
    return
  }

  memberContacts = contactsData || []
}

const combinedMembers = (memberRows || []).map((member) => ({
  ...member,
  profile: memberProfiles.find(
    (profile) => profile.id === member.user_id
  ),
  contact: memberContacts.find(
    (contact) => contact.user_id === member.user_id
  ),
}))

setTeamMembers(combinedMembers)
setLoading(false)
    }

    loadTeam()
  }, [id])

  async function handleReport(event) {
    event.preventDefault()
    setReporting(true)
    setReportMessage('')
    const { error } = await supabase.from('reports').insert({ target_type: 'team', target_id: String(team.id), reason: reportReason, details: reportDetails.trim() || null })
    if (error) setReportMessage(`Could not submit report: ${error.message}`)
    else { setReportMessage('Report submitted. An administrator will review it.'); setShowReportForm(false); setReportDetails('') }
    setReporting(false)
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading team...
      </main>
    )
  }

  if (errorMessage || !team) {
    return (
      <main className="flex min-h-screen items-center bg-slate-950 px-6 pb-16 pt-36 text-white">
        <div className="mx-auto w-full max-w-3xl"><FriendlyState icon={loadErrorType === 'missing' ? 'missing' : 'network'} eyebrow={loadErrorType === 'missing' ? 'Listing unavailable' : 'Connection problem'} title={loadErrorType === 'missing' ? 'This team could not be found' : 'The team could not load'} description={loadErrorType === 'missing' ? 'It may have been removed or the link may be incorrect.' : 'We couldn’t reach ShipPact. Check your connection and try again.'} actionLabel={loadErrorType === 'missing' ? 'Browse teams' : 'Try again'} actionTo={loadErrorType === 'missing' ? '/teams' : undefined} onAction={loadErrorType === 'network' ? () => window.location.reload() : undefined} secondaryLabel="Go home" secondaryTo="/" /></div>
      </main>
    )
  }

  const isCreator = currentUser?.id === team.creator_id
  const canMessageTeam =
    isCreator || existingRequest?.status === 'accepted'
  const isExpired = Boolean(team.deadline && new Date(`${team.deadline}T23:59:59`) < new Date())

  if (isExpired && !canMessageTeam) {
    return <main className="flex min-h-screen items-center px-6 pb-16 pt-36 text-white"><div className="mx-auto w-full max-w-3xl"><FriendlyState icon="expired" eyebrow={team.event_name} title="This team listing has expired" description="Its application deadline has passed, so it is no longer accepting requests. Explore active teams instead." actionLabel="Find active teams" actionTo="/teams" secondaryLabel="Go home" secondaryTo="/" /></div></main>
  }

 function handleJoinClick() {
  if (!currentUser) {
    navigate('/login')
    return
  }

  setShowApplicationForm(true)
  setSuccessMessage('')
}

async function handleApplicationSubmit(event) {
  event.preventDefault()
  setSubmitting(true)
  setErrorMessage('')
  setSuccessMessage('')

  if (!currentUser) {
    navigate('/login')
    return
  }

  const { data, error } = await supabase
    .from('join_requests')
    .insert({
      post_id: team.id,
      applicant_id: currentUser.id,
      requested_role: requestedRole,
      message: applicationMessage.trim(),
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      setErrorMessage(
        'You have already applied to this team.'
      )
    } else {
      setErrorMessage(error.message)
    }

    setSubmitting(false)
    return
  }

  setExistingRequest(data)
  setSuccessMessage('Your join request was sent successfully!')
  setShowApplicationForm(false)
  setSubmitting(false)
}

  return (
    <main className="min-h-screen bg-slate-950 px-6 pb-16 pt-32 text-white">
      <section className="mx-auto max-w-5xl">
        <Link
          to="/teams"
          className="text-sm font-semibold text-indigo-400 hover:text-indigo-300"
        >
          ← Back to teams
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[2fr_1fr]">
          <article className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-indigo-400">
                  {team.event_name}
                </p>

                <h1 className="mt-2 text-4xl font-bold">
                  {team.title}
                </h1>
              </div>

              <TeamLifecycleBadge stage={team.lifecycle_stage} />
            </div>

            <p className="mt-6 whitespace-pre-line leading-8 text-slate-300">
              {team.description}
            </p>

            <div className="mt-8">
              <h2 className="text-lg font-bold">
                Required roles
              </h2>

              <div className="mt-3 flex flex-wrap gap-2">
                {(team.required_roles || []).map((role) => (
                  <span
                    key={role}
                    className="rounded-full bg-indigo-500/10 px-3 py-1 text-sm text-indigo-300"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-bold">
                Required skills
              </h2>

              <div className="mt-3 flex flex-wrap gap-2">
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

            <div className="mt-8 grid gap-5 border-t border-slate-800 pt-8 sm:grid-cols-2">
              <Detail label="Project type" value={team.project_type} />

              <Detail label="Work mode" value={team.work_mode} />

              <Detail
                label="Team members"
                value={`${team.current_members}/${team.maximum_members}`}
              />

              <Detail
                label="Deadline"
                value={
                  team.deadline
                    ? new Date(
                        `${team.deadline}T00:00:00`
                      ).toLocaleDateString()
                    : 'Not specified'
                }
              />

              <Detail
                label="Time commitment"
                value={team.time_commitment || 'Not specified'}
              />
            </div>

            <div className="mt-8 border-t border-slate-800 pt-8">
  <div className="flex items-center justify-between gap-4">
    <h2 className="text-xl font-bold">
      Team members
    </h2>

    <span className="text-sm text-slate-400">
      {team.current_members}/{team.maximum_members}
    </span>
  </div>

  {teamMembers.length === 0 ? (
    <p className="mt-4 text-slate-400">
      No team members found.
    </p>
  ) : (
    <div className="mt-5 grid gap-4 sm:grid-cols-2">
      {teamMembers.map((member) => (
        <div
          key={member.id}
          className="rounded-xl border border-slate-800 bg-slate-950 p-5"
        >
          <h3 className="font-bold text-white">
            {member.profile?.full_name || 'Student'}
          </h3>

          {member.profile?.is_srm_verified && (
            <div className="mt-2">
              <SrmVerifiedBadge compact />
            </div>
          )}

          <p className="mt-1 text-sm font-semibold text-indigo-400">
            {member.role}
          </p>

          {member.profile?.department && (
            <p className="mt-2 text-sm text-slate-400">
              {member.profile.department}
            </p>
          )}

          {member.profile?.skills?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {member.profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          {member.contact && (
            <div className="mt-4 border-t border-slate-800 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-green-400">
                Accepted teammate contact
              </p>
              <ContactValue contact={member.contact} />
            </div>
          )}
        </div>
      ))}
    </div>
  )}
</div>
          {canMessageTeam && (
            <Link
              to={`/messages/${team.id}`}
              className="mt-8 block w-full rounded-xl bg-indigo-500 px-6 py-3 text-center font-semibold hover:bg-indigo-400"
            >
              Open Team Chat
            </Link>
          )}
          {isCreator ? (
  <p className="mt-8 rounded-xl bg-indigo-500/10 p-4 text-indigo-300">
    You created this team post.
  </p>
) : existingRequest ? (
  <div className="mt-8 rounded-xl border border-slate-700 bg-slate-950 p-5">
    <p className="text-sm text-slate-400">
      Application status
    </p>

    <p
      className={`mt-2 text-lg font-bold capitalize ${
        existingRequest.status === 'accepted'
          ? 'text-green-400'
          : existingRequest.status === 'rejected'
            ? 'text-red-400'
            : 'text-yellow-400'
      }`}
    >
      {existingRequest.status}
    </p>

    <p className="mt-3 text-sm text-slate-400">
      Requested role:{' '}
      <span className="text-slate-200">
        {existingRequest.requested_role}
      </span>
    </p>
  </div>
) : showApplicationForm ? (
  <form
    onSubmit={handleApplicationSubmit}
    className="mt-8 space-y-5 rounded-xl border border-slate-700 bg-slate-950 p-6"
  >
    <div>
      <label
        htmlFor="requestedRole"
        className="mb-2 block text-sm font-medium text-slate-300"
      >
        Which role are you applying for?
      </label>

      <select
        id="requestedRole"
        value={requestedRole}
        onChange={(event) => setRequestedRole(event.target.value)}
        required
        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-indigo-400"
      >
        <option value="">Select a role</option>

        {(team.required_roles || []).map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>
    </div>

    <div>
      <label
        htmlFor="applicationMessage"
        className="mb-2 block text-sm font-medium text-slate-300"
      >
        Message <span className="text-slate-500">(optional)</span>
      </label>

      <textarea
        id="applicationMessage"
        value={applicationMessage}
        onChange={(event) =>
          setApplicationMessage(event.target.value)
        }
        placeholder="Introduce yourself, explain your experience and describe how you can contribute."
        maxLength="500"
        rows="5"
        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-indigo-400"
      />
    </div>

    <div className="flex flex-col gap-3 sm:flex-row">
      <button
        type="submit"
        disabled={submitting}
        className="rounded-xl bg-indigo-500 px-5 py-3 font-semibold hover:bg-indigo-400 disabled:opacity-60"
      >
        {submitting ? 'Sending...' : 'Send Join Request'}
      </button>

      <button
        type="button"
        onClick={() => setShowApplicationForm(false)}
        className="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-300 hover:border-slate-500"
      >
        Cancel
      </button>
    </div>
  </form>
) : (
  <button
    type="button"
    onClick={handleJoinClick}
    disabled={
      team.status !== 'open' ||
      team.current_members >= team.maximum_members
    }
    className="mt-8 w-full rounded-xl bg-indigo-500 px-6 py-3 font-semibold hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
  >
    {team.status !== 'open'
      ? 'Applications Closed'
      : team.current_members >= team.maximum_members
        ? 'Team Full'
        : 'Request to Join'}
  </button>
)}
{successMessage && (
  <p className="mt-4 rounded-xl bg-green-500/10 p-4 text-green-400">
    {successMessage}
  </p>
)}
               


          </article>

          <aside className="h-fit rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm font-semibold text-indigo-400">
              Team creator
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              {creator?.full_name || 'Student'}
            </h2>

            {creator?.is_srm_verified && (
              <div className="mt-3">
                <SrmVerifiedBadge compact />
              </div>
            )}

            <p className="mt-2 text-slate-400">
              {[creator?.department, creator?.college]
                .filter(Boolean)
                .join(' · ') || 'Student profile'}
            </p>

            {creator?.study_year && (
              <p className="mt-2 text-sm text-slate-500">
                {creator.study_year}
              </p>
            )}

            {creator?.bio && (
              <p className="mt-5 leading-7 text-slate-300">
                {creator.bio}
              </p>
            )}

            {creator?.skills?.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {creator.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3">
              {creator?.github_url && (
                <a
                  href={creator.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-400 hover:text-indigo-300"
                >
                  View GitHub
                </a>
              )}

              {creator?.linkedin_url && (
                <a
                  href={creator.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-400 hover:text-indigo-300"
                >
                  View LinkedIn
                </a>
              )}
            </div>

            {!isCreator && (
              <div className="mt-7 border-t border-slate-800 pt-6">
                {!showReportForm ? <button type="button" onClick={() => setShowReportForm(true)} className="text-sm font-semibold text-slate-500 hover:text-rose-300">Report this listing</button> : (
                  <form onSubmit={handleReport} className="space-y-4">
                    <div><label className="mb-2 block text-sm font-medium text-slate-300">Reason</label><select value={reportReason} onChange={(event) => setReportReason(event.target.value)} className="w-full rounded-xl border border-slate-700 px-4 py-3"><option value="misleading">Misleading information</option><option value="spam">Spam</option><option value="harassment">Harassment</option><option value="unsafe">Unsafe content</option><option value="other">Other</option></select></div>
                    <div><label className="mb-2 block text-sm font-medium text-slate-300">Details <span className="text-slate-500">(optional)</span></label><textarea value={reportDetails} onChange={(event) => setReportDetails(event.target.value)} maxLength="1000" rows="3" className="w-full rounded-xl border border-slate-700 px-4 py-3" placeholder="Help the admin understand the issue." /></div>
                    <div className="flex gap-2"><button disabled={reporting} className="app-button bg-rose-500/80 text-sm hover:bg-rose-500 disabled:opacity-50">{reporting ? 'Submitting...' : 'Submit report'}</button><button type="button" onClick={() => setShowReportForm(false)} className="app-button border border-slate-700 text-sm text-slate-300">Cancel</button></div>
                  </form>
                )}
                {reportMessage && <p className={`mt-3 text-sm ${reportMessage.startsWith('Could') ? 'text-rose-300' : 'text-emerald-300'}`}>{reportMessage}</p>}
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  )
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-semibold text-slate-200">
        {value}
      </p>
    </div>
  )
}

function ContactValue({ contact }) {
  const { contact_type: type, contact_value: value } = contact
  let href = ''

  if (type === 'Email') {
    href = `mailto:${value}`
  } else if (type === 'WhatsApp') {
    href = value.startsWith('http')
      ? value
      : `https://wa.me/${value.replace(/\D/g, '')}`
  } else if (type === 'LinkedIn' || value.startsWith('http')) {
    href = value
  }

  if (!href) {
    return (
      <p className="mt-2 break-all font-semibold text-slate-200">
        {type}: {value}
      </p>
    )
  }

  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noreferrer' : undefined}
      className="mt-2 block break-all font-semibold text-indigo-400 hover:text-indigo-300"
    >
      {type}: {value} ↗
    </a>
  )
}

export default TeamDetails
