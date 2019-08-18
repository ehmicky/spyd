// Normalize 'limit' option
export const normalizeLimits = function({ limit: limits, ...opts }) {
  const limitsA = limits.map(normalizeLimit)
  return { ...opts, limits: limitsA }
}

const normalizeLimit = function(limit) {
  const limitA = stringify(limit)

  if (!limitA.includes('=')) {
    return { percentage: getPercentage(limitA) }
  }

  const [ids, percentage] = limitA.split('=')
  const percentageA = getPercentage(percentage)
  const idsA = ids.split(',').filter(Boolean)
  return { ids: idsA, percentage: percentageA }
}

const stringify = function(limit) {
  if (Number.isFinite(limit)) {
    return String(limit)
  }

  if (typeof limit !== 'string') {
    throw new TypeError(`'limit' must be an array of strings: ${limit}`)
  }

  return limit
}

const getPercentage = function(string) {
  const percentage = Number(string)

  if (!Number.isFinite(percentage) || percentage <= 0) {
    throw new TypeError(`'limit' must be a positive percentage: ${string}`)
  }

  return percentage
}
