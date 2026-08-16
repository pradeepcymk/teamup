import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import SrmVerifiedBadge from '../components/SrmVerifiedBadge'

const emptyProfile = {
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
  contact_type: 'Email',
  contact_value: '',
  looking_for_team: true,
}

function Profile() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(emptyProfile)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSrmVerified, setIsSrmVerified] = useState(false)

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

      const { data: contactData, error: contactError } = await supabase
        .from('private_contacts')
        .select('contact_type, contact_value')
        .eq('user_id', user.id)
        .maybeSingle()

      if (contactError) {
        setErrorMessage(contactError.message)
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
        contact_type: contactData?.contact_type || 'Email',
        contact_value: contactData?.contact_value || '',
        looking_for_team: data.looking_for_team ?? true,
      })
      setIsSrmVerified(data.is_srm_verified === true)
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

    const contactValue = profile.contact_value.trim()
    let contactError

    if (contactValue) {
      const { error: upsertError } = await supabase
        .from('private_contacts')
        .upsert({
          user_id: user.id,
          contact_type: profile.contact_type,
          contact_value: contactValue,
          updated_at: new Date().toISOString(),
        })

      contactError = upsertError
    } else {
      const { error: deleteError } = await supabase
        .from('private_contacts')
        .delete()
        .eq('user_id', user.id)

      contactError = deleteError
    }

    if (contactError) {
      setErrorMessage(contactError.message)
      setSaving(false)
      return
    }

    setMessage('Profile saved successfully!')
    setSaving(false)
    setIsEditing(false)
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
  const labelStyle = 'mb-2 block text-sm font-medium text-slate-300'
  const skills = profile.skills.split(',').map((item) => item.trim()).filter(Boolean)
  const roles = profile.preferred_roles.split(',').map((item) => item.trim()).filter(Boolean)
  const completionItems = [
    { label: 'Skills', complete: skills.length > 0 },
    { label: 'Availability', complete: Boolean(profile.availability) },
    { label: 'GitHub or portfolio', complete: Boolean(profile.github_url || profile.linkedin_url) },
    { label: 'Private contact', complete: Boolean(profile.contact_value.trim()) },
    { label: 'Bio', complete: Boolean(profile.bio.trim()) },
  ]
  const completedItems = completionItems.filter((item) => item.complete).length
  const completionPercentage = Math.round((completedItems / completionItems.length) * 100)

  return (
    <main className="min-h-screen bg-slate-950 px-6 pb-16 pt-32 text-white">
      <section className="mx-auto max-w-3xl">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="font-semibold text-indigo-400">Your builder profile</p>
            <h1 className="mt-2 text-4xl font-bold">My profile</h1>
            <p className="mt-4 text-slate-400">
              This is how team creators see your skills and availability.
            </p>
          </div>

          {!isEditing && (
            <button
              type="button"
              onClick={() => {
                setIsEditing(true)
                setMessage('')
              }}
              aria-label="Edit profile"
              title="Edit profile"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-700 text-slate-300 hover:border-indigo-400 hover:text-indigo-300"
            >
              <span aria-hidden="true">✎</span>
            </button>
          )}
        </div>

        {errorMessage && (
          <p className="mt-6 rounded-lg bg-red-500/10 p-3 text-red-400">
            {errorMessage}
          </p>
        )}

        {message && !isEditing && (
          <p className="mt-6 rounded-lg bg-green-500/10 p-3 text-green-400">
            {message}
          </p>
        )}

        {!isEditing && (
          <section className="mt-8 rounded-2xl border border-indigo-400/20 bg-indigo-500/5 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-white">Profile completion</p>
                <p className="mt-1 text-sm text-slate-400">
                  Complete profiles help creators make confident decisions.
                </p>
              </div>
              <span className="text-2xl font-bold text-indigo-300">{completionPercentage}%</span>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {completionItems.map((item) => (
                <span
                  key={item.label}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${item.complete ? 'bg-green-500/10 text-green-400' : 'bg-slate-800 text-slate-400'}`}
                >
                  {item.complete ? '✓' : '+'} {item.label}
                </span>
              ))}
            </div>

            {completionPercentage < 100 && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="mt-5 font-semibold text-indigo-300 hover:text-indigo-200"
              >
                Complete your profile →
              </button>
            )}
          </section>
        )}

        {!isEditing ? (
          <article className="mt-10 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
            <div className="border-b border-slate-800 p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold">
                    {profile.full_name || 'Student'}
                  </h2>
                  {isSrmVerified && (
                    <div className="mt-3">
                      <SrmVerifiedBadge />
                    </div>
                  )}
                  <p className="mt-2 text-slate-400">
                    {[profile.department, profile.study_year].filter(Boolean).join(' · ') || 'Academic details not added'}
                  </p>
                  <p className="mt-1 text-slate-500">
                    {profile.college || 'College not added'}
                  </p>
                </div>

                <span className={`rounded-full px-3 py-1 text-sm font-semibold ${profile.looking_for_team ? 'bg-green-500/10 text-green-400' : 'bg-slate-800 text-slate-400'}`}>
                  {profile.looking_for_team ? 'Looking for a team' : 'Not looking right now'}
                </span>
              </div>

              {profile.bio && (
                <p className="mt-6 whitespace-pre-line leading-7 text-slate-300">
                  {profile.bio}
                </p>
              )}
            </div>

            <div className="grid gap-8 p-8 md:grid-cols-2">
              <ProfileList title="Skills" items={skills} empty="No skills added" />
              <ProfileList title="Preferred roles" items={roles} empty="No roles added" accent />

              <ProfileDetail label="Availability" value={profile.availability || 'Not specified'} />

              <div>
                <p className="text-sm text-slate-500">Private team contact</p>
                <p className="mt-2 font-semibold text-slate-200">
                  {profile.contact_value
                    ? `${profile.contact_type}: ${profile.contact_value}`
                    : 'Not added'}
                </p>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Only teammates accepted into one of your teams can access this.
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Links</p>
                <div className="mt-2 flex flex-wrap gap-4">
                  {profile.github_url && <ProfileLink href={profile.github_url}>GitHub ↗</ProfileLink>}
                  {profile.linkedin_url && <ProfileLink href={profile.linkedin_url}>LinkedIn ↗</ProfileLink>}
                  {!profile.github_url && !profile.linkedin_url && <p className="font-semibold text-slate-300">No links added</p>}
                </div>
              </div>
            </div>
          </article>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10 space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-8">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-bold">Edit profile</h2>
              <button type="button" onClick={() => setIsEditing(false)} className="text-sm font-semibold text-slate-400 hover:text-white">
                Cancel
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Field label="Full name" name="full_name" value={profile.full_name} onChange={handleChange} required inputStyle={inputStyle} />
              <Field label="College" name="college" value={profile.college} onChange={handleChange} required placeholder="SRM Institute of Science and Technology" inputStyle={inputStyle} />
              <Field label="Department" name="department" value={profile.department} onChange={handleChange} required placeholder="Computer Science" inputStyle={inputStyle} />

              <div>
                <label className={labelStyle}>Year of study</label>
                <select name="study_year" value={profile.study_year} onChange={handleChange} required className={inputStyle}>
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
              <textarea name="bio" value={profile.bio} onChange={handleChange} placeholder="Tell other students what you enjoy building." rows="4" className={inputStyle} />
            </div>

            <Field label="Skills — separate them with commas" name="skills" value={profile.skills} onChange={handleChange} placeholder="React, Python, Figma" inputStyle={inputStyle} />
            <Field label="Preferred roles — separate them with commas" name="preferred_roles" value={profile.preferred_roles} onChange={handleChange} placeholder="Frontend Developer, UI/UX Designer" inputStyle={inputStyle} />

            <div>
              <label className={labelStyle}>Availability</label>
              <select name="availability" value={profile.availability} onChange={handleChange} className={inputStyle}>
                <option value="">Select availability</option>
                <option value="Weekdays">Weekdays</option>
                <option value="Weekends">Weekends</option>
                <option value="Evenings">Evenings</option>
                <option value="Flexible">Flexible</option>
              </select>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Field label="GitHub profile" name="github_url" type="url" value={profile.github_url} onChange={handleChange} placeholder="https://github.com/username" inputStyle={inputStyle} />
              <Field label="LinkedIn profile" name="linkedin_url" type="url" value={profile.linkedin_url} onChange={handleChange} placeholder="https://linkedin.com/in/username" inputStyle={inputStyle} />
            </div>

            <div className="rounded-xl border border-indigo-400/20 bg-indigo-500/5 p-5">
              <p className="font-semibold text-white">Private contact after acceptance</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                This remains private until another student is accepted into the same team.
              </p>

              <div className="mt-5 grid gap-5 md:grid-cols-[1fr_2fr]">
                <div>
                  <label className={labelStyle}>Contact type</label>
                  <select name="contact_type" value={profile.contact_type} onChange={handleChange} className={inputStyle}>
                    <option value="Email">Email</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Discord">Discord</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <Field
                  label="Contact email, username or link"
                  name="contact_value"
                  value={profile.contact_value}
                  onChange={handleChange}
                  maxLength="200"
                  placeholder="you@example.com or https://wa.me/..."
                  inputStyle={inputStyle}
                />
              </div>
            </div>

            <label className="flex items-center gap-3 text-slate-300">
              <input name="looking_for_team" type="checkbox" checked={profile.looking_for_team} onChange={handleChange} className="h-5 w-5 accent-indigo-500" />
              I am currently looking for a team
            </label>

            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={saving} className="rounded-xl bg-indigo-500 px-6 py-3 font-semibold hover:bg-indigo-400 disabled:opacity-60">
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
              <button type="button" onClick={() => setIsEditing(false)} className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-slate-300 hover:border-slate-500">
                Cancel
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  )
}

function Field({ label, inputStyle, ...inputProps }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-300">{label}</label>
      <input {...inputProps} className={inputStyle} />
    </div>
  )
}

function ProfileList({ title, items, empty, accent = false }) {
  return (
    <div>
      <p className="text-sm text-slate-500">{title}</p>
      {items.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {items.map((item) => (
            <span key={item} className={`rounded-full px-3 py-1 text-sm ${accent ? 'bg-indigo-500/10 text-indigo-300' : 'bg-slate-800 text-slate-300'}`}>
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-2 font-semibold text-slate-300">{empty}</p>
      )}
    </div>
  )
}

function ProfileDetail({ label, value }) {
  return (
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 font-semibold text-slate-200">{value}</p>
    </div>
  )
}

function ProfileLink({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="font-semibold text-indigo-400 hover:text-indigo-300">
      {children}
    </a>
  )
}

export default Profile
