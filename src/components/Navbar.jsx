import { useEffect, useRef, useState } from 'react'
import {
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { supabase } from '../lib/supabase'
import NotificationBell from './NotificationBell'

function Navbar() {
  const [user, setUser] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const accountMenuRef = useRef(null)

  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      setUser(user)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setAccountOpen(false)
  }, [location.pathname])

  useEffect(() => {
    function closeAccountMenu(event) {
      if (!accountMenuRef.current?.contains(event.target)) {
        setAccountOpen(false)
      }
    }

    document.addEventListener('mousedown', closeAccountMenu)
    return () => document.removeEventListener('mousedown', closeAccountMenu)
  }, [])

  async function handleLogout() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      alert(error.message)
      return
    }

    setMenuOpen(false)
    setAccountOpen(false)
    navigate('/')
  }

  const navigationLink =
    'rounded-lg px-3 py-2 font-semibold text-slate-300 hover:bg-slate-800 hover:text-white'

  return (
    <nav className="absolute left-0 top-0 z-50 w-full border-b border-slate-800/60 bg-slate-950/90 px-6 py-5 backdrop-blur-md md:px-12">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link
          to="/"
          className="text-2xl font-bold text-white"
        >
          Ship<span className="text-indigo-400">Pact</span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-3 xl:flex">
          <Link to="/#how-it-works" className={navigationLink}>
            How It Works
          </Link>

          <Link to="/teams" className={navigationLink}>
            Find Teammates
          </Link>

          <Link to="/#why-shippact" className={navigationLink}>
            Why ShipPact
          </Link>

          {user ? (
            <>
              <div className="mx-2 h-6 w-px bg-slate-700" />

              <Link to="/messages" className={navigationLink}>
                Messages
              </Link>

              <NotificationBell userId={user.id} />

              <div ref={accountMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setAccountOpen((current) => !current)}
                  aria-expanded={accountOpen}
                  aria-haspopup="menu"
                  className="flex max-w-52 items-center gap-3 rounded-xl border border-slate-700 px-3 py-2 text-left text-white hover:border-indigo-400"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 font-bold text-indigo-300">
                    {(user.user_metadata?.full_name || user.email || 'U').charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                    {user.user_metadata?.full_name || user.email}
                  </span>
                  <span className={`text-xs text-slate-400 transition ${accountOpen ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>

                {accountOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full mt-3 w-60 rounded-2xl border border-slate-700 bg-slate-900 p-2 shadow-2xl shadow-black/40"
                  >
                    <Link to="/profile" className={`block ${navigationLink}`}>
                      My Profile
                    </Link>
                    <Link to="/onboarding" className={`block ${navigationLink}`}>
                      Getting Started
                    </Link>
                    <Link to="/my-teams" className={`block ${navigationLink}`}>
                      My Teams
                    </Link>
                    <Link to="/my-requests" className={`block ${navigationLink}`}>
                      My Requests
                    </Link>
                    <Link to="/applications" className={`block ${navigationLink}`}>
                      Applications
                    </Link>
                    <div className="my-2 border-t border-slate-700" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full rounded-lg px-3 py-2 text-left font-semibold text-red-400 hover:bg-red-500/10"
                    >
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="mx-2 h-6 w-px bg-slate-700" />

              <Link to="/login" className={navigationLink}>
                Log In
              </Link>

              <Link
                to="/signup"
                className="rounded-lg bg-indigo-500 px-4 py-2 font-semibold text-white hover:bg-indigo-400"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile notifications and menu button */}
        <div className="flex items-center gap-2 xl:hidden">
          {user && <NotificationBell userId={user.id} />}
          <button
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-lg border border-slate-700 text-white hover:border-indigo-400"
          >
          <span
            className={`h-0.5 w-5 bg-current transition ${
              menuOpen ? 'translate-y-2 rotate-45' : ''
            }`}
          />

          <span
            className={`h-0.5 w-5 bg-current transition ${
              menuOpen ? 'opacity-0' : ''
            }`}
          />

          <span
            className={`h-0.5 w-5 bg-current transition ${
              menuOpen ? '-translate-y-2 -rotate-45' : ''
            }`}
          />
          </button>
        </div>
      </div>

      {/* Mobile and tablet menu */}
      {menuOpen && (
        <div className="mx-auto mt-5 max-w-7xl border-t border-slate-800 pt-5 xl:hidden">
          <div className="flex flex-col gap-2">
            <Link to="/#how-it-works" className={navigationLink}>
              How It Works
            </Link>

            <Link to="/teams" className={navigationLink}>
              Find Teammates
            </Link>

            <Link to="/#why-shippact" className={navigationLink}>
              Why ShipPact
            </Link>

            {user ? (
              <>
                <div className="my-2 border-t border-slate-800" />

                <p className="px-3 py-1 text-sm text-slate-500">
                  Signed in as
                </p>

                <p className="truncate px-3 pb-2 font-semibold text-white">
                  {user.user_metadata?.full_name || user.email}
                </p>

                <Link to="/profile" className={navigationLink}>
                  My Profile
                </Link>

                <Link to="/onboarding" className={navigationLink}>
                  Getting Started
                </Link>

                <Link to="/my-teams" className={navigationLink}>
                  My Teams
                </Link>

                <Link
                  to="/my-requests"
                  className={navigationLink}
                >
                  My Requests
                </Link>

                <Link to="/messages" className={navigationLink}>
                  Messages
                </Link>

                <Link
                  to="/applications"
                  className={navigationLink}
                >
                  Applications
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-3 rounded-lg border border-red-500/60 px-4 py-3 text-left font-semibold text-red-400 hover:bg-red-500/10"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <div className="my-2 border-t border-slate-800" />

                <Link to="/login" className={navigationLink}>
                  Log In
                </Link>

                <Link
                  to="/signup"
                  className="rounded-lg bg-indigo-500 px-4 py-3 text-center font-semibold text-white hover:bg-indigo-400"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
