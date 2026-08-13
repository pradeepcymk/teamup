const sampleTeams = [
  {
    id: 1,
    title: 'AI Waste Management System',
    event: 'Smart India Hackathon',
    description:
      'Building an AI platform that identifies and sorts different types of waste.',
    roles: ['React Developer', 'UI/UX Designer'],
    skills: ['React', 'Python', 'Figma'],
    members: '4/6',
  },
  {
    id: 2,
    title: 'Student Expense Tracker',
    event: 'College Project',
    description:
      'A simple application that helps students understand and control their spending.',
    roles: ['Backend Developer'],
    skills: ['Node.js', 'Supabase'],
    members: '2/4',
  },
]

function BrowseTeams() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 pb-16 pt-32 text-white md:px-12">
      <section className="mx-auto max-w-6xl">
        <p className="font-semibold text-indigo-400">Find your people</p>

        <h1 className="mt-2 text-4xl font-bold">Browse open teams</h1>

        <p className="mt-4 max-w-2xl text-slate-400">
          Discover hackathons and student projects that need your skills.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {sampleTeams.map((team) => (
            <article
              key={team.id}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
            >
              <p className="text-sm font-semibold text-indigo-400">
                {team.event}
              </p>

              <h2 className="mt-2 text-2xl font-bold">{team.title}</h2>

              <p className="mt-3 leading-7 text-slate-400">
                {team.description}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {team.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-slate-400">
                  Members: {team.members}
                </p>

                <button className="rounded-lg bg-indigo-500 px-4 py-2 font-semibold hover:bg-indigo-400">
                  View Team
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default BrowseTeams