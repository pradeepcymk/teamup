function Navbar() {
  return (
    <nav className="absolute left-0 top-0 flex w-full items-center justify-between px-6 py-6 md:px-12">
      <a href="/" className="text-2xl font-bold text-white">
        Team<span className="text-indigo-400">Up</span>
      </a>

      <div className="hidden items-center gap-8 text-sm font-medium text-slate-300 md:flex">
        <a href="#how-it-works" className="hover:text-white">
          How It Works
        </a>

        <a href="/teams" className="hover:text-white">
          Browse Teams
        </a>

        <a href="#about" className="hover:text-white">
          About
        </a>
      </div>

      <div className="flex items-center gap-3">
        <a
          href="/login"
          className="rounded-lg bg-indigo-500 px-4 py-2 font-semibold text-white hover:bg-indigo-400"
        >
          Log In
        </a>

        <button className="rounded-lg bg-indigo-500 px-4 py-2 font-semibold text-white hover:bg-indigo-400">
          Sign Up
        </button>
      </div>
    </nav>
  )
}

export default Navbar