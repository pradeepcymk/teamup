function SrmVerifiedBadge({ compact = false }) {
  return (
    <span
      title="Email-confirmed account using an approved SRM domain"
      className={`inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 font-semibold text-green-400 ${compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'}`}
    >
      <span aria-hidden="true">✓</span>
      Verified SRM Student
    </span>
  )
}

export default SrmVerifiedBadge
