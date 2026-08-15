import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Profile() {
  const navigate = useNavigate()

  const [profile, setProfile] = useState({
    full_name: '',
    college: '',
    department: '',
    study_year: '',
    bio: '',
    skills: '',
    preferred_roles: '',
    availability: '',
    github_url: '',
    linkedin_url: '',
    looking_for_team: true,
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        navigate('/login')
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        setErrorMessage(error.message)
        setLoading(false)
        return
      }

      setProfile({
        full_name: data.full_name || '',
        college: data.college || '',
        department: data.department || '',
        study_year: data.study_year || '',
        bio: data.bio || '',
        skills: (data.skills || []).join(', '),
        preferred_roles: (data.preferred_roles || []).join(', '),
        availability: data.availability || '',
        github_url: data.github_url || '',
        linkedin_url: data.linkedin_url || '',
        looking_for_team: data.looking_for_team,
      })

      setLoading(false)
    }

    loadProfile()
  }, [navigate])

  function handleChange(event) {
    const { name, value, type, checked } = event.target

    setProfile((currentProfile) => ({
      ...currentProfile,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    setErrorMessage('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      navigate('/login')
      return
    }

    const skills = profile.skills
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean)

    const preferredRoles = profile.preferred_roles
      .split(',')
      .map((role) => role.trim())
      .filter(Boolean)

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        college: profile.college,
        department: profile.department,
        study_year: profile.study_year,
        bio: profile.bio,
        skills,
        preferred_roles: preferredRoles,
        availability: profile.availability,
        github_url: profile.github_url,
        linkedin_url: profile.linkedin_url,
        looking_for_team: profile.looking_for_team,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) {
      setErrorMessage(error.message)
      setSaving(false)
      return
    }

    setMessage('Profile saved successfully!')
    setSaving(false)
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading profile...
      </main>
    )
  }

  const inputStyle =
    'w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-indigo-400'

  const labelStyle =
    'mb-2 block text-sm font-medium text-slate-300'

  return (
    <main className="min-h-screen bg-slate-950 px-6 pb-16 pt-32 text-white">
      <section className="mx-auto max-w-3xl">
        <p className="font-semibold text-indigo-400">Your builder profile</p>

        <h1 className="mt-2 text-4xl font-bold">
          Show teams how you contribute
        </h1>

        <p className="mt-4 text-slate-400">
          Share your skills, availability and proof of work so teammates know what they can count on.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-8"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className={labelStyle}>Full name</label>
              <input
                name="full_name"
                value={profile.full_name}
                onChange={handleChange}
                required
                className={inputStyle}
              />
            </div>

            <div>
              <label className={labelStyle}>College</label>
              <input
                name="college"
                value={profile.college}
                onChange={handleChange}
                placeholder="SRM Institute of Science and Technology"
                required
                className={inputStyle}
              />
            </div>

            <div>
              <label className={labelStyle}>Department</label>
              <input
                name="department"
                value={profile.department}
                onChange={handleChange}
                placeholder="Computer Science"
                required
                className={inputStyle}
              />
            </div>

            <div>
              <label className={labelStyle}>Year of study</label>
              <select
                name="study_year"
                value={profile.study_year}
                onChange={handleChange}
                required
                className={inputStyle}
              >
                <option value="">Select year</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Postgraduate">Postgraduate</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelStyle}>Short bio</label>
            <textarea
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              placeholder="Tell other students what you enjoy building."
              rows="4"
              className={inputStyle}
            />
          </div>

          <div>
            <label className={labelStyle}>
              Skills — separate them with commas
            </label>
            <input
              name="skills"
              value={profile.skills}
              onChange={handleChange}
              placeholder="React, Python, Figma"
              className={inputStyle}
            />
          </div>

          <div>
            <label className={labelStyle}>
              Preferred roles — separate them with commas
            </label>
            <input
              name="preferred_roles"
              value={profile.preferred_roles}
              onChange={handleChange}
              placeholder="Frontend Developer, UI/UX Designer"
              className={inputStyle}
            />
          </div>

          <div>
            <label className={labelStyle}>Availability</label>
            <select
              name="availability"
              value={profile.availability}
              onChange={handleChange}
              className={inputStyle}
            >
              <option value="">Select availability</option>
              <option value="Weekdays">Weekdays</option>
              <option value="Weekends">Weekends</option>
              <option value="Evenings">Evenings</option>
              <option value="Flexible">Flexible</option>
            </select>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className={labelStyle}>GitHub profile</label>
              <input
                name="github_url"
                type="url"
                value={profile.github_url}
                onChange={handleChange}
                placeholder="https://github.com/username"
                className={inputStyle}
              />
            </div>

            <div>
              <label className={labelStyle}>LinkedIn profile</label>
              <input
                name="linkedin_url"
                type="url"
                value={profile.linkedin_url}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/username"
                className={inputStyle}
              />
            </div>
          </div>

          <label className="flex items-center gap-3 text-slate-300">
            <input
              name="looking_for_team"
              type="checkbox"
              checked={profile.looking_for_team}
              onChange={handleChange}
              className="h-5 w-5 accent-indigo-500"
            />
            I am currently looking for a team
          </label>

          {errorMessage && (
            <p className="rounded-lg bg-red-500/10 p-3 text-red-400">
              {errorMessage}
            </p>
          )}

          {message && (
            <p className="rounded-lg bg-green-500/10 p-3 text-green-400">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-indigo-500 px-6 py-3 font-semibold hover:bg-indigo-400 disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default Profile
