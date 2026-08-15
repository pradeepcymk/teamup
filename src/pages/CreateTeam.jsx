import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function CreateTeam() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: '',
    event_name: '',
    description: '',
    project_type: '',
    required_skills: '',
    required_roles: '',
    current_members: 1,
    maximum_members: 2,
    deadline: '',
    work_mode: '',
    time_commitment: '',
  })

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  function handleChange(event) {
    const { name, value } = event.target

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setErrorMessage('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      navigate('/login')
      return
    }

    const currentMembers = Number(form.current_members)
    const maximumMembers = Number(form.maximum_members)

    if (currentMembers > maximumMembers) {
      setErrorMessage(
        'Current members cannot be greater than maximum members.'
      )
      setLoading(false)
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

    const { error } = await supabase.from('team_posts').insert({
      creator_id: user.id,
      title: form.title,
      event_name: form.event_name,
      description: form.description,
      project_type: form.project_type,
      required_skills: requiredSkills,
      required_roles: requiredRoles,
      current_members: currentMembers,
      maximum_members: maximumMembers,
      deadline: form.deadline,
      work_mode: form.work_mode,
      time_commitment: form.time_commitment,
    })

    if (error) {
      setErrorMessage(error.message)
      setLoading(false)
      return
    }

    navigate('/teams')
  }

  const inputStyle =
    'w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-indigo-400'

  const labelStyle =
    'mb-2 block text-sm font-medium text-slate-300'

  const today = new Date().toISOString().split('T')[0]

  return (
    <main className="min-h-screen bg-slate-950 px-6 pb-16 pt-32 text-white">
      <section className="mx-auto max-w-3xl">
        <p className="font-semibold text-indigo-400">
          Make the pact
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          Form a committed team
        </h1>

        <p className="mt-4 text-slate-400">
          Set clear roles, availability and deadlines before inviting teammates.
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
              placeholder="AI Waste Management System"
              required
              className={inputStyle}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className={labelStyle}>
                Event or project name
              </label>
              <input
                name="event_name"
                value={form.event_name}
                onChange={handleChange}
                placeholder="Smart India Hackathon"
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
                <option value="">Select type</option>
                <option value="Hackathon">Hackathon</option>
                <option value="College Project">
                  College Project
                </option>
                <option value="Personal Project">
                  Personal Project
                </option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelStyle}>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the problem, idea and current progress."
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
              placeholder="Frontend Developer, UI/UX Designer"
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
              placeholder="React, Python, Figma"
              required
              className={inputStyle}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className={labelStyle}>Current members</label>
              <input
                name="current_members"
                type="number"
                min="1"
                value={form.current_members}
                onChange={handleChange}
                required
                className={inputStyle}
              />
            </div>

            <div>
              <label className={labelStyle}>Maximum members</label>
              <input
                name="maximum_members"
                type="number"
                min="2"
                value={form.maximum_members}
                onChange={handleChange}
                required
                className={inputStyle}
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className={labelStyle}>
                Application deadline
              </label>
              <input
                name="deadline"
                type="date"
                min={today}
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
                <option value="">Select mode</option>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelStyle}>Time commitment</label>
            <input
              name="time_commitment"
              value={form.time_commitment}
              onChange={handleChange}
              placeholder="Weekends, approximately 5 hours per week"
              required
              className={inputStyle}
            />
          </div>

          {errorMessage && (
            <p className="rounded-lg bg-red-500/10 p-3 text-red-400">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-indigo-500 px-6 py-3 font-semibold hover:bg-indigo-400 disabled:opacity-60"
          >
            {loading ? 'Publishing...' : 'Publish Team Pact'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default CreateTeam
