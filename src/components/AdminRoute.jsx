import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import FriendlyState from './FriendlyState'

function AdminRoute({ children }) {
  const [state, setState] = useState('loading')

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setState('signed-out'); return }
      const { data, error } = await supabase.rpc('is_admin')
      setState(!error && data === true ? 'allowed' : 'denied')
    }
    checkAdmin()
  }, [])

  if (state === 'loading') return <main className="min-h-screen px-6 pt-36 text-white"><div className="skeleton mx-auto h-72 max-w-4xl rounded-3xl" /></main>
  if (state === 'signed-out') return <Navigate to="/login" replace />
  if (state === 'denied') return <main className="min-h-screen px-6 pb-16 pt-36 text-white"><div className="mx-auto max-w-3xl"><FriendlyState icon="lock" eyebrow="Restricted area" title="Admin access required" description="This dashboard is available only to approved ShipPact administrators." actionLabel="Return home" actionTo="/" /></div></main>
  return children
}

export default AdminRoute
