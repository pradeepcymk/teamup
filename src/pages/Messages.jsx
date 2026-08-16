import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import FriendlyState from '../components/FriendlyState'

function Messages() {
  const { teamId } = useParams()
  const navigate = useNavigate()
  const bottomRef = useRef(null)

  const [currentUser, setCurrentUser] = useState(null)
  const [teams, setTeams] = useState([])
  const [selectedTeamId, setSelectedTeamId] = useState(teamId || '')
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [loadingTeams, setLoadingTeams] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [unauthorizedTeam, setUnauthorizedTeam] = useState(false)

  useEffect(() => {
    async function loadTeams() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        navigate('/login')
        return
      }

      setCurrentUser(user)

      const { data: memberships, error: membershipsError } = await supabase
        .from('team_members')
        .select('post_id, role')
        .eq('user_id', user.id)

      if (membershipsError) {
        setErrorMessage(membershipsError.message)
        setLoadingTeams(false)
        return
      }

      const postIds = (memberships || []).map((membership) => membership.post_id)

      if (postIds.length === 0) {
        setTeams([])
        setLoadingTeams(false)
        return
      }

      const { data: teamPosts, error: teamsError } = await supabase
        .from('team_posts')
        .select('id, title, event_name, status')
        .in('id', postIds)
        .order('created_at', { ascending: false })

      if (teamsError) {
        setErrorMessage(teamsError.message)
        setLoadingTeams(false)
        return
      }

      const availableTeams = teamPosts || []
      setTeams(availableTeams)

      const requestedTeam = availableTeams.find(
        (team) => String(team.id) === String(teamId)
      )
      if (teamId && !requestedTeam) {
        setUnauthorizedTeam(true)
        setSelectedTeamId('')
        setLoadingTeams(false)
        return
      }
      const initialTeamId = requestedTeam?.id || availableTeams[0]?.id || ''

      setSelectedTeamId(initialTeamId)
      if (initialTeamId && initialTeamId !== teamId) {
        navigate(`/messages/${initialTeamId}`, { replace: true })
      }

      setLoadingTeams(false)
    }

    loadTeams()
  }, [navigate, teamId])

  const loadMessages = useCallback(async () => {
    if (!selectedTeamId) {
      setMessages([])
      return
    }

    setLoadingMessages(true)
    setErrorMessage('')

    const { data: messageRows, error: messagesError } = await supabase
      .from('team_messages')
      .select('id, post_id, sender_id, body, created_at')
      .eq('post_id', selectedTeamId)
      .order('created_at', { ascending: true })

    if (messagesError) {
      setErrorMessage(messagesError.message)
      setLoadingMessages(false)
      return
    }

    const senderIds = [...new Set((messageRows || []).map((message) => message.sender_id))]
    let profiles = []

    if (senderIds.length > 0) {
      const { data: profileRows, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', senderIds)

      if (profilesError) {
        setErrorMessage(profilesError.message)
        setLoadingMessages(false)
        return
      }

      profiles = profileRows || []
    }

    setMessages(
      (messageRows || []).map((message) => ({
        ...message,
        sender: profiles.find((profile) => profile.id === message.sender_id),
      }))
    )
    setLoadingMessages(false)
  }, [selectedTeamId])

  useEffect(() => {
    loadMessages()

    if (!selectedTeamId) return undefined

    const channel = supabase
      .channel(`team-chat-${selectedTeamId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'team_messages',
          filter: `post_id=eq.${selectedTeamId}`,
        },
        () => loadMessages()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadMessages, selectedTeamId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function chooseTeam(id) {
    setUnauthorizedTeam(false)
    setSelectedTeamId(id)
    navigate(`/messages/${id}`)
  }

  async function handleSend(event) {
    event.preventDefault()
    const body = draft.trim()

    if (!body || !selectedTeamId || !currentUser) return

    setSending(true)
    setErrorMessage('')

    const { error } = await supabase.from('team_messages').insert({
      post_id: selectedTeamId,
      sender_id: currentUser.id,
      body,
    })

    if (error) {
      setErrorMessage(error.message)
      setSending(false)
      return
    }

    setDraft('')
    setSending(false)
    await loadMessages()
  }

  const selectedTeam = teams.find((team) => team.id === selectedTeamId)

  return (
    <main className="min-h-screen bg-slate-950 px-6 pb-16 pt-32 text-white md:px-12">
      <section className="mx-auto max-w-7xl">
        <p className="font-semibold text-indigo-400">Accepted teams only</p>
        <h1 className="mt-2 text-4xl font-bold">Team messages</h1>
        <p className="mt-4 text-slate-400">
          Private conversations for teams you have joined.
        </p>

        {errorMessage && !loadingTeams && <div className="mt-8"><FriendlyState icon="network" eyebrow="Connection problem" title="Messages could not load" description="We couldn’t reach ShipPact’s message service. Check your connection and refresh the page." actionLabel="Try again" onAction={() => window.location.reload()} compact /></div>}

        {errorMessage ? null : loadingTeams ? (
          <div className="surface-card mt-10 grid overflow-hidden rounded-2xl lg:grid-cols-[280px_1fr]" aria-label="Loading messages">
            <div className="border-r border-slate-800 p-5">
              <div className="skeleton h-4 w-24 rounded" />
              <div className="skeleton mt-6 h-16 w-full rounded-xl" />
              <div className="skeleton mt-3 h-16 w-full rounded-xl" />
            </div>
            <div className="p-6">
              <div className="skeleton h-7 w-40 rounded" />
              <div className="mt-16 space-y-4">
                <div className="skeleton h-14 w-2/5 rounded-2xl" />
                <div className="skeleton ml-auto h-14 w-1/3 rounded-2xl" />
              </div>
              <div className="skeleton mt-32 h-12 w-full rounded-xl" />
            </div>
          </div>
        ) : unauthorizedTeam ? (
          <div className="mt-10"><FriendlyState icon="lock" eyebrow="Private team chat" title="You don’t have access to this conversation" description="Only the team creator and accepted members can read or send messages in this chat." actionLabel="Open your messages" actionTo="/messages" secondaryLabel="Browse teams" secondaryTo="/teams" /></div>
        ) : teams.length === 0 ? (
          <div className="surface-card mt-10 rounded-2xl px-6 py-9 text-center">
            <div className="empty-visual" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="h-8 w-8 fill-none stroke-current" strokeWidth="1.6">
                <path d="M20 15a3 3 0 0 1-3 3H9l-5 3v-3a3 3 0 0 1-2-3V7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v8Z" strokeLinejoin="round" /><path d="M7 9h10M7 13h6" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className="mt-5 text-2xl font-bold">No team chats yet</h2>
            <p className="mt-3 text-slate-400">
              A chat becomes available after you create a team or your application is accepted.
            </p>
            <Link to="/teams" className="app-button mt-6 bg-indigo-500 hover:bg-indigo-400">
              Find Teammates
            </Link>
          </div>
        ) : (
          <div className="surface-card mt-10 grid h-[clamp(500px,62vh,680px)] overflow-hidden rounded-2xl lg:grid-cols-[290px_1fr]">
            <aside className="border-b border-slate-800 bg-slate-800/35 p-4 lg:border-b-0 lg:border-r">
              <p className="px-3 pb-3 text-sm font-semibold text-slate-500">Your teams</p>
              <div className="space-y-2">
                {teams.map((team) => (
                  <button
                    key={team.id}
                    type="button"
                    onClick={() => chooseTeam(team.id)}
                    className={`w-full rounded-xl px-4 py-3 text-left ${String(team.id) === String(selectedTeamId) ? 'bg-indigo-500/15 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
                  >
                    <span className="block font-semibold">{team.title}</span>
                    <span className="mt-1 block truncate text-xs text-slate-500">{team.event_name}</span>
                  </button>
                ))}
              </div>
            </aside>

            <div className="flex min-h-0 flex-col">
              <header className="border-b border-slate-800 px-6 py-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold">{selectedTeam?.title}</h2>
                    <p className="mt-1 text-sm text-slate-500">{selectedTeam?.event_name}</p>
                  </div>
                  {selectedTeam && (
                    <Link to={`/teams/${selectedTeam.id}`} className="text-sm font-semibold text-indigo-400 hover:text-indigo-300">
                      View team
                    </Link>
                  )}
                </div>
              </header>

              <div className="flex-1 space-y-4 overflow-y-auto p-6">
                {loadingMessages ? (
                  <p className="text-slate-500">Loading messages...</p>
                ) : messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-center">
                    <div className="max-w-sm">
                      <div className="empty-visual" aria-hidden="true">
                        <svg viewBox="0 0 24 24" className="h-8 w-8 fill-none stroke-current" strokeWidth="1.6">
                          <path d="M20 15a3 3 0 0 1-3 3H9l-5 3v-3a3 3 0 0 1-2-3V7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v8Z" strokeLinejoin="round" /><path d="M8 11h.01M12 11h.01M16 11h.01" strokeLinecap="round" strokeWidth="2" />
                        </svg>
                      </div>
                      <h3 className="mt-5 text-xl font-bold">Start the conversation</h3>
                      <p className="mt-2 text-slate-500">Coordinate your first task, meeting or deadline.</p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isOwn = message.sender_id === currentUser?.id

                    return (
                      <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-3 md:max-w-[70%] ${isOwn ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-200'}`}>
                          {!isOwn && (
                            <p className="mb-1 text-xs font-semibold text-indigo-300">
                              {message.sender?.full_name || 'Teammate'}
                            </p>
                          )}
                          <p className="whitespace-pre-wrap break-words leading-6">{message.body}</p>
                          <p className={`mt-2 text-right text-[11px] ${isOwn ? 'text-indigo-100' : 'text-slate-500'}`}>
                            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={handleSend} className="border-t border-slate-800 p-4">
                <div className="flex gap-3">
                  <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault()
                        event.currentTarget.form?.requestSubmit()
                      }
                    }}
                    rows="1"
                    maxLength="1000"
                    placeholder="Message your team..."
                    className="min-h-12 flex-1 resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-indigo-400"
                  />
                  <button
                    type="submit"
                    disabled={sending || !draft.trim()}
                    className="rounded-xl bg-indigo-500 px-6 font-semibold hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {sending ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}

export default Messages
