import { Link } from 'react-router-dom'

const benefits = [
  {
    number: '01',
    title: 'Show what you can build',
    description:
      'Create a campus profile with your skills, preferred roles, availability and proof of work.',
  },
  {
    number: '02',
    title: 'Match the missing role',
    description:
      'Find SRM hackathon and semester-project teams looking for exactly what you bring.',
  },
  {
    number: '03',
    title: 'Commit and ship',
    description:
      'Agree on the deadline, work mode and weekly commitment before joining the team.',
  },
]

function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 px-6 pb-20 pt-32 text-white md:px-12">
      <section className="relative mx-auto flex min-h-[70vh] max-w-7xl items-center">
        <div className="pointer-events-none absolute -right-40 top-0 h-96 w-96 rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-40 bottom-0 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-400/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-indigo-300">
            <span className="h-2 w-2 rounded-full bg-green-400" />
            Built for SRM campus builders
          </div>

          <h1 className="max-w-6xl text-5xl font-bold leading-tight tracking-tight md:text-7xl">
            <span className="md:block">Find teammates</span>{' '}
            <span className="md:block">
              who{' '}
              <span className="whitespace-nowrap text-indigo-400">
                actually show up.
              </span>
            </span>
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl">
            ShipPact helps SRM students form committed teams for hackathons
            and semester projects—matched by skills, availability and
            deadlines.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <Link
              to="/teams"
              className="rounded-xl bg-indigo-500 px-7 py-3.5 text-center font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-400"
            >
              Find a Teammate
            </Link>

            <Link
              to="/create-team"
              className="rounded-xl border border-slate-600 px-7 py-3.5 text-center font-semibold text-white hover:border-indigo-400 hover:bg-indigo-400/10"
            >
              Form a Team
            </Link>
          </div>

          <p className="mt-5 text-sm text-slate-500">
            Find the right role. Set the commitment. Ship on time.
          </p>
        </div>
      </section>

      <section
        id="how-it-works"
        className="mx-auto max-w-7xl scroll-mt-28 border-t border-slate-800 py-20"
      >
        <div className="max-w-2xl">
          <p className="font-semibold uppercase tracking-[0.18em] text-indigo-400">
            A better team pact
          </p>
          <h2 className="mt-3 text-3xl font-bold md:text-5xl">
            Skills matter. Commitment ships projects.
          </h2>
          <p className="mt-5 leading-7 text-slate-400">
            Stop joining random groups that disappear after day one. Make
            expectations clear before the work begins.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {benefits.map((benefit) => (
            <article
              key={benefit.number}
              className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6"
            >
              <p className="font-mono text-sm text-indigo-400">
                {benefit.number}
              </p>
              <h3 className="mt-5 text-xl font-bold">{benefit.title}</h3>
              <p className="mt-3 leading-7 text-slate-400">
                {benefit.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="why-shippact"
        className="mx-auto max-w-7xl scroll-mt-28 rounded-3xl border border-indigo-400/20 bg-indigo-500/10 px-6 py-12 text-center md:px-12"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-300">
          Your next build starts here
        </p>
        <h2 className="mt-3 text-3xl font-bold md:text-4xl">
          Find committed campus builders. Form a team. Ship on time.
        </h2>
        <Link
          to="/signup"
          className="mt-7 inline-block rounded-xl bg-white px-7 py-3.5 font-semibold text-slate-950 hover:bg-indigo-100"
        >
          Join ShipPact
        </Link>
      </section>
    </main>
  )
}

export default Home
