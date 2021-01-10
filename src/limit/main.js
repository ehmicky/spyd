import { getSlowError } from './error.js'

// Use the `limit` configuration property to add `combination.slow` and
// `combination.slowError`
export const getLimit = function ({
  combination: {
    name,
    stats: { median },
    limitPercentage,
  },
  previousMedian,
  diff,
}) {
  if (
    previousMedian === undefined ||
    previousMedian === 0 ||
    limitPercentage === undefined
  ) {
    return { slow: false }
  }

  const limit = previousMedian * (1 + limitPercentage / PERCENTAGE_RATIO)
  const slow = median >= limit
  const slowError = getSlowError({
    slow,
    name,
    limitPercentage,
    diff,
  })
  return { limit, slow, slowError }
}

const PERCENTAGE_RATIO = 1e2
