import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import FriendlyState from '../components/FriendlyState'
import { supabase } from '../lib/supabase'

const metrics = [
  { key: 'total_users', label: 'Total users', icon: '◎', tone: 'text-cyan-300' },
  { key: 'verified_srm_users', label: 'Verified SRM users', icon: '✓', tone: 'text-emerald-300' },
  { key: 'active_teams', label: 'Active teams', icon: '◇', tone: 'text-indigo-300' },
  { key: 'pending_applications', label: 'Pending applications', icon: '↗', tone: 'text-amber-300' },
  { key: 'completed_projects', label: 'Completed projects', icon: '★', tone: 'text-violet-300' },
  { key: 'reports_to_review', label: 'Reports to review', icon: '!', tone: 'text-rose-300' },
]

function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [updatingId, setUpdatingId] = useState('')

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setErrorMessage('')
    const [{ data: statsData, error: statsError }, { data: reportRows, error: reportsError }] = await Promise.all([
      supabase.rpc('get_admin_dashboard_stats'),
      supabase.from('reports').select('id, reporter_id, target_type, target_id, reason, details, status, created_at, reviewed_at').eq('status', 'pending').order('created_at', { ascending: false }).limit(50),
    ])
    if (statsError || reportsError) setErrorMessage(statsError?.message || reportsError?.message)
    else { setStats(statsData); setReports(reportRows || []) }
    setLoading(false)
  }, [])

  useEffect(() => { loadDashboard() }, [loadDashboard])

  async function resolveReport(id, status) {
    setUpdatingId(id)
    const { error } = await supabase.from('reports').update({ status, reviewed_at: new Date().toISOString() }).eq('id', id)
    if (error) setErrorMessage(error.message)
    else await loadDashboard()
    setUpdatingId('')
  }

  return (
    <main className="min-h-screen px-6 pb-16 pt-36 text-white md:px-12">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div><p className="page-eyebrow">ShipPact operations</p><h1 className="page-title">Admin dashboard</h1><p className="mt-4 text-slate-400">Monitor marketplace health and review community reports.</p></div>
          <button type="button" onClick={loadDashboard} className="app-button border border-slate-700 text-slate-200 hover:border-indigo-400">Refresh data</button>
        </div>

        {loading ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{metrics.map((metric) => <div key={metric.key} className="skeleton h-36 rounded-2xl" />)}</div>
        ) : errorMessage ? (
          <div className="mt-10"><FriendlyState icon="network" eyebrow="Connection problem" title="Dashboard data could not load" description="Check your connection and try again. No data was changed." actionLabel="Try again" onAction={loadDashboard} compact /></div>
        ) : (
          <>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {metrics.map((metric) => <article key={metric.key} className="interactive-card surface-card rounded-2xl p-6"><div className="flex items-center justify-between"><p className="text-sm font-semibold text-slate-400">{metric.label}</p><span className={`text-xl ${metric.tone}`}>{metric.icon}</span></div><p className="mt-5 text-4xl font-bold">{Number(stats?.[metric.key] || 0).toLocaleString()}</p></article>)}
            </div>

            <section className="mt-12">
              <div className="flex items-center justify-between"><div><p className="page-eyebrow">Trust and safety</p><h2 className="mt-2 text-2xl font-bold">Reports requiring review</h2></div><span className="status-badge bg-rose-500/10 text-rose-300">{reports.length} pending</span></div>
              {reports.length === 0 ? <div className="mt-6"><FriendlyState icon="empty" title="Review queue is clear" description="There are no unresolved community reports right now." compact /></div> : (
                <div className="mt-6 space-y-4">{reports.map((report) => <article key={report.id} className="surface-card rounded-2xl p-6"><div className="flex flex-wrap justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><span className="status-badge bg-rose-500/10 text-rose-300">{report.reason}</span><span className="text-xs text-slate-500">{new Date(report.created_at).toLocaleString()}</span></div><h3 className="mt-4 font-bold">Reported {report.target_type} #{report.target_id}</h3><p className="mt-2 max-w-3xl leading-6 text-slate-400">{report.details || 'No additional details provided.'}</p></div><div className="flex items-start gap-2"><Link to={report.target_type === 'team' ? `/teams/${report.target_id}` : '/'} className="app-button border border-slate-700 text-sm text-slate-200">Inspect</Link><button disabled={updatingId === report.id} onClick={() => resolveReport(report.id, 'dismissed')} className="app-button border border-slate-700 text-sm text-slate-300 disabled:opacity-50">Dismiss</button><button disabled={updatingId === report.id} onClick={() => resolveReport(report.id, 'resolved')} className="app-button bg-indigo-500 text-sm disabled:opacity-50">Resolve</button></div></div></article>)}</div>
              )}
            </section>
          </>
        )}
      </section>
    </main>
  )
}

export default AdminDashboard
