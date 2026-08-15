export const APPROVED_SRM_EMAIL_DOMAINS = ['srmist.edu.in']

export function getEmailDomain(email = '') {
  return email.trim().toLowerCase().split('@')[1] || ''
}

export function isApprovedSrmEmail(email) {
  return APPROVED_SRM_EMAIL_DOMAINS.includes(getEmailDomain(email))
}
