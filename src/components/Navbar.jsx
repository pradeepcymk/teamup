import { useEffect, useState } from 'react'
import {
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Navbar() {
  const [user, setUser] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)

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
  }, [location.pathname])

  async function handleLogout() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      alert(error.message)
      return
    }

    setMenuOpen(false)
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
          <Link to="/" className={navigationLink}>
            Home
          </Link>

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

              <Link to="/profile" className={navigationLink}>
                My Profile
              </Link>

              <Link to="/my-teams" className={navigationLink}>
                My Teams
              </Link>

              <Link to="/my-requests" className={navigationLink}>
                My Requests
              </Link>

              <Link
                to="/applications"
                className={navigationLink}
              >
                Applications
              </Link>

              <span className="max-w-32 truncate px-2 text-sm text-slate-400">
                {user.user_metadata?.full_name || user.email}
              </span>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-slate-700 px-4 py-2 font-semibold text-white hover:border-indigo-400"
              >
                Log Out
              </button>
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

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-lg border border-slate-700 text-white hover:border-indigo-400 xl:hidden"
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

      {/* Mobile and tablet menu */}
      {menuOpen && (
        <div className="mx-auto mt-5 max-w-7xl border-t border-slate-800 pt-5 xl:hidden">
          <div className="flex flex-col gap-2">
            <Link to="/" className={navigationLink}>
              Home
            </Link>

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

                <Link to="/my-teams" className={navigationLink}>
                  My Teams
                </Link>

                <Link
                  to="/my-requests"
                  className={navigationLink}
                >
                  My Requests
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
