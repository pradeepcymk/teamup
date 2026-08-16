import FriendlyState from '../components/FriendlyState'

function NotFound() {
  return <main className="flex min-h-screen items-center px-6 pb-16 pt-36 text-white"><div className="mx-auto w-full max-w-3xl"><FriendlyState icon="missing" eyebrow="404 error" title="This page drifted off course" description="The link may be outdated, or the page may have moved. Let’s get you back to active teams." actionLabel="Browse teams" actionTo="/teams" secondaryLabel="Go home" secondaryTo="/" /></div></main>
}

export default NotFound
