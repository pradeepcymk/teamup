import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Navbar() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

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

  async function handleLogout() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      alert(error.message)
      return
    }

    navigate('/')
  }

  return (
    <nav className="absolute left-0 top-0 z-10 flex w-full items-center justify-between px-6 py-6 md:px-12">
      <Link to="/" className="text-2xl font-bold text-white">
        Team<span className="text-indigo-400">Up</span>
      </Link>

      <div className="hidden items-center gap-8 text-sm font-medium text-slate-300 md:flex">
        <Link to="/" className="hover:text-white">
          How It Works
        </Link>

        <Link to="/teams" className="hover:text-white">
          Browse Teams
        </Link>

        <Link to="/" className="hover:text-white">
          About
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <>
          <Link
  to="/profile"
  className="px-4 py-2 font-semibold text-slate-300 hover:text-white"
>
  My Profile
</Link>
            <span className="hidden text-sm text-slate-400 lg:block">
              {user.user_metadata.full_name || user.email}
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
            <Link
              to="/login"
              className="px-4 py-2 font-semibold text-slate-300 hover:text-white"
            >
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
    </nav>
  )
}

export default Navbar