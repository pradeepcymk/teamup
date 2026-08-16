import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function NotificationBell({ userId }) {
  const navigate = useNavigate()
  const menuRef = useRef(null)
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadNotifications = useCallback(async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (!error) setNotifications(data || [])
    setLoading(false)
  }, [userId])

  useEffect(() => {
    if (!userId) return undefined

    supabase.rpc('generate_deadline_notifications').then(() => loadNotifications())

    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((current) => [
            payload.new,
            ...current.filter((item) => item.id !== payload.new.id),
          ].slice(0, 20))
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [loadNotifications, userId])

  useEffect(() => {
    function closeMenu(event) {
      if (!menuRef.current?.contains(event.target)) setOpen(false)
    }

    document.addEventListener('mousedown', closeMenu)
    return () => document.removeEventListener('mousedown', closeMenu)
  }, [])

  const unreadCount = notifications.filter((item) => !item.read_at).length

  async function openNotification(notification) {
    if (!notification.read_at) {
      const readAt = new Date().toISOString()
      await supabase
        .from('notifications')
        .update({ read_at: readAt })
        .eq('id', notification.id)

      setNotifications((current) => current.map((item) => (
        item.id === notification.id ? { ...item, read_at: readAt } : item
      )))
    }

    setOpen(false)
    if (notification.link) navigate(notification.link)
  }

  async function markAllRead() {
    const readAt = new Date().toISOString()
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: readAt })
      .eq('user_id', userId)
      .is('read_at', null)

    if (!error) {
      setNotifications((current) => current.map((item) => ({
        ...item,
        read_at: item.read_at || readAt,
      })))
    }
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={open}
        className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 text-slate-300 hover:border-indigo-400 hover:text-white"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-500 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-3 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/50">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
            <div>
              <p className="font-bold text-white">Notifications</p>
              <p className="text-xs text-slate-500">{unreadCount} unread</p>
            </div>
            {unreadCount > 0 && (
              <button type="button" onClick={markAllRead} className="text-xs font-semibold text-indigo-300 hover:text-indigo-200">
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto p-2">
            {loading && <p className="p-4 text-sm text-slate-400">Loading...</p>}
            {!loading && notifications.length === 0 && (
              <p className="p-6 text-center text-sm text-slate-400">You’re all caught up.</p>
            )}
            {notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => openNotification(notification)}
                className={`w-full rounded-xl p-3 text-left hover:bg-slate-800 ${notification.read_at ? '' : 'bg-indigo-500/10'}`}
              >
                <div className="flex gap-3">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notification.read_at ? 'bg-slate-700' : 'bg-indigo-400'}`} />
                  <span className="min-w-0">
                    <span className="block font-semibold text-white">{notification.title}</span>
                    <span className="mt-1 block text-sm leading-5 text-slate-400">{notification.body}</span>
                    <span className="mt-2 block text-xs text-slate-600">{formatNotificationTime(notification.created_at)}</span>
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function formatNotificationTime(value) {
  const difference = Date.now() - new Date(value).getTime()
  const minutes = Math.max(0, Math.floor(difference / 60000))
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return new Date(value).toLocaleDateString()
}

export default NotificationBell
