// Normalize 'system' option
// Can be either "systemId" or "systemId/systemTitle"
export const normalizeSystem = function({ system, ...opts }) {
  const [id, title = id] = system.trim().split(SLASH_REGEXP)
  return { ...opts, system: { id, title } }
}

const SLASH_REGEXP = / *\/ */u
