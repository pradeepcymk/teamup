import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function EditTeam() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: '',
    event_name: '',
    description: '',
    project_type: '',
    required_skills: '',
    required_roles: '',
    maximum_members: 2,
    deadline: '',
    work_mode: '',
    time_commitment: '',
  })

  const [currentMembers, setCurrentMembers] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function loadTeam() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        navigate('/login')
        return
      }

      const { data, error } = await supabase
        .from('team_posts')
        .select('*')
        .eq('id', id)
        .eq('creator_id', user.id)
        .single()

      if (error || !data) {
        setErrorMessage(
          'Team not found, or you do not have permission to edit it.'
        )
        setLoading(false)
        return
      }

      setCurrentMembers(data.current_members)

      setForm({
        title: data.title || '',
        event_name: data.event_name || '',
        description: data.description || '',
        project_type: data.project_type || '',
        required_skills: (data.required_skills || []).join(', '),
        required_roles: (data.required_roles || []).join(', '),
        maximum_members: data.maximum_members,
        deadline: data.deadline || '',
        work_mode: data.work_mode || '',
        time_commitment: data.time_commitment || '',
      })

      setLoading(false)
    }

    loadTeam()
  }, [id, navigate])

  function handleChange(event) {
    const { name, value } = event.target

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setErrorMessage('')

    const maximumMembers = Number(form.maximum_members)

    if (maximumMembers < currentMembers) {
      setErrorMessage(
        `Maximum members cannot be lower than the current member count of ${currentMembers}.`
      )
      setSaving(false)
      return
    }

    const requiredSkills = form.required_skills
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean)

    const requiredRoles = form.required_roles
      .split(',')
      .map((role) => role.trim())
      .filter(Boolean)

    const { error } = await supabase
      .from('team_posts')
      .update({
        title: form.title,
        event_name: form.event_name,
        description: form.description,
        project_type: form.project_type,
        required_skills: requiredSkills,
        required_roles: requiredRoles,
        maximum_members: maximumMembers,
        deadline: form.deadline || null,
        work_mode: form.work_mode,
        time_commitment: form.time_commitment,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      setErrorMessage(error.message)
      setSaving(false)
      return
    }

    navigate(`/teams/${id}`)
  }

  const inputStyle =
    'w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-indigo-400'

  const labelStyle =
    'mb-2 block text-sm font-medium text-slate-300'

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading team...
      </main>
    )
  }

  if (errorMessage && !form.title) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 text-white">
        <h1 className="text-3xl font-bold">
          Cannot edit this team
        </h1>

        <p className="mt-4 text-red-400">
          {errorMessage}
        </p>

        <Link
          to="/my-teams"
          className="mt-6 rounded-xl bg-indigo-500 px-5 py-3 font-semibold"
        >
          Back to My Teams
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 pb-16 pt-32 text-white">
      <section className="mx-auto max-w-3xl">
        <Link
          to="/my-teams"
          className="font-semibold text-indigo-400 hover:text-indigo-300"
        >
          ← Back to My Teams
        </Link>

        <p className="mt-8 font-semibold text-indigo-400">
          Creator dashboard
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          Edit team
        </h1>

        <p className="mt-4 text-slate-400">
          Update your project information and team requirements.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-8"
        >
          <div>
            <label className={labelStyle}>Post title</label>

            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className={inputStyle}
            />
          </div>

          <div>
            <label className={labelStyle}>
              Event or project name
            </label>

            <input
              name="event_name"
              value={form.event_name}
              onChange={handleChange}
              required
              className={inputStyle}
            />
          </div>

          <div>
            <label className={labelStyle}>Project type</label>

            <select
              name="project_type"
              value={form.project_type}
              onChange={handleChange}
              required
              className={inputStyle}
            >
              <option value="Hackathon">Hackathon</option>
              <option value="College Project">College Project</option>
              <option value="Personal Project">Personal Project</option>
            </select>
          </div>

          <div>
            <label className={labelStyle}>Description</label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="5"
              required
              className={inputStyle}
            />
          </div>

          <div>
            <label className={labelStyle}>
              Required roles — separate with commas
            </label>

            <input
              name="required_roles"
              value={form.required_roles}
              onChange={handleChange}
              required
              className={inputStyle}
            />
          </div>

          <div>
            <label className={labelStyle}>
              Required skills — separate with commas
            </label>

            <input
              name="required_skills"
              value={form.required_skills}
              onChange={handleChange}
              required
              className={inputStyle}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className={labelStyle}>
                Current members
              </label>

              <input
                value={currentMembers}
                disabled
                className={`${inputStyle} cursor-not-allowed opacity-60`}
              />
            </div>

            <div>
              <label className={labelStyle}>
                Maximum members
              </label>

              <input
                name="maximum_members"
                type="number"
                min={Math.max(2, currentMembers)}
                value={form.maximum_members}
                onChange={handleChange}
                required
                className={inputStyle}
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className={labelStyle}>Deadline</label>

              <input
                name="deadline"
                type="date"
                value={form.deadline}
                onChange={handleChange}
                required
                className={inputStyle}
              />
            </div>

            <div>
              <label className={labelStyle}>Work mode</label>

              <select
                name="work_mode"
                value={form.work_mode}
                onChange={handleChange}
                required
                className={inputStyle}
              >
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelStyle}>
              Time commitment
            </label>

            <input
              name="time_commitment"
              value={form.time_commitment}
              onChange={handleChange}
              required
              className={inputStyle}
            />
          </div>

          {errorMessage && (
            <p className="rounded-xl bg-red-500/10 p-4 text-red-400">
              {errorMessage}
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-indigo-500 px-6 py-3 font-semibold hover:bg-indigo-400 disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>

            <Link
              to="/my-teams"
              className="rounded-xl border border-slate-700 px-6 py-3 text-center font-semibold text-slate-300 hover:border-slate-500"
            >
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </main>
  )
}

export default EditTeam