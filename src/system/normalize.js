import slugify from 'slugify'

// Normalize 'system' option
export const normalizeSystem = function({ system, run, ...opts }) {
  const title = system.trim()
  const id = slugify(title, { lower: true, remove: INVALID_ID_REGEXP })
  return { ...opts, run, system: { id, title } }
}

const INVALID_ID_REGEXP = /[^ a-zA-Z\d_.-]/gu
