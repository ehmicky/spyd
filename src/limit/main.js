import { getSlowError } from './error.js'

// Use the `limit` configuration property to:
//  - add `combination.limit`
//  - add `combination.slow`
//  - add `combination.slowError`
export const getLimit = function ({
  combination,
  combination: {
    name,
    stats: { median },
  },
  limits,
  previousMedian,
  diff,
}) {
  if (previousMedian === undefined || previousMedian === 0) {
    return { slow: false }
  }

  const percentages = limits
    .filter(({ ids }) => isTarget(combination, ids))
    .map(getPercentage)

  if (percentages.length === 0) {
    return { slow: false }
  }

  const percentage = Math.max(...percentages)
  const limit = previousMedian * (1 + percentage / PERCENTAGE_RATIO)
  const slow = median >= limit
  const slowError = getSlowError({ slow, name, percentage, diff })
  return { limit, slow, slowError }
}

const isTarget = function ({ taskId, inputId, commandRunner, systemId }, ids) {
  return (
    ids === undefined ||
    ids.some(
      (id) =>
        taskId === id ||
        inputId === id ||
        commandRunner === id ||
        systemId === id,
    )
  )
}

const getPercentage = function ({ percentage }) {
  return percentage
}

const PERCENTAGE_RATIO = 1e2
