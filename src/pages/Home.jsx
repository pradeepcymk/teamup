function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <section className="text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-indigo-400">
          Build better teams
        </p>

        <h1 className="text-5xl font-bold text-white md:text-7xl">
          Team<span className="text-indigo-400">Up</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-300">
          Find skilled teammates for hackathons, college projects and
          competitions.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <button className="rounded-xl bg-indigo-500 px-6 py-3 font-semibold text-white hover:bg-indigo-400">
            Find a Team
          </button>

          <button className="rounded-xl border border-slate-600 px-6 py-3 font-semibold text-white hover:border-indigo-400">
            Create a Team
          </button>
        </div>
      </section>
    </main>
  )
}

export default Home