function Login() {
  function handleSubmit(event) {
    event.preventDefault()
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 pt-24">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <p className="font-semibold text-indigo-400">
          Welcome back
        </p>

        <h1 className="mt-2 text-3xl font-bold text-white">
          Log in to TeamUp
        </h1>

        <p className="mt-3 text-slate-400">
          Continue finding and building great teams.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Email address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="student@example.com"
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-indigo-400"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-indigo-400"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-indigo-500 px-4 py-3 font-semibold text-white hover:bg-indigo-400"
          >
            Log In
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Don&apos;t have an account?{' '}
          <a
            href="/signup"
            className="font-semibold text-indigo-400 hover:text-indigo-300"
          >
            Sign up
          </a>
        </p>
      </section>
    </main>
  )
}

export default Login