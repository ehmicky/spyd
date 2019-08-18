import { validateStringArray } from '../options/validate.js'

// Normalize 'limit' option
export const normalizeLimits = function({ limit, ...opts }) {
  validateStringArray(limit, 'limit')

  const limitA = limit.map(normalizeLimit)
  return { ...opts, limit: limitA }
}

const normalizeLimit = function(limit) {
  if (!limit.includes('=')) {
    return { percentage: getPercentage(limit) }
  }

  const [ids, percentage] = limit.split('=')
  const percentageA = getPercentage(percentage)
  const idsA = ids.split(',').filter(Boolean)
  return { ids: idsA, percentage: percentageA }
}

const getPercentage = function(string) {
  const percentage = Number(string)

  if (!Number.isFinite(percentage) || percentage <= 0) {
    throw new TypeError(`Limit must be a positive percentage: ${string}`)
  }

  return percentage
}
