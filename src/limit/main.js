// Use the `limit` option to:
//  - add `iteration.limit`
//  - add `iteration.slow`
//  - add `iteration.slowError`
export const getLimit = function({
  iteration,
  iteration: {
    stats: { median },
  },
  limits,
  previousMedian,
}) {
  if (previousMedian === undefined || previousMedian === 0) {
    return { slow: false }
  }

  const percentages = limits
    .filter(({ ids }) => isTarget(iteration, ids))
    .map(getPercentage)

  if (percentages.length === 0) {
    return { slow: false }
  }

  const percentage = Math.max(...percentages)
  const limit = previousMedian * (1 + percentage / PERCENTAGE_RATIO)
  const slow = median >= limit
  return { limit, slow }
}

const PERCENTAGE_RATIO = 1e2

const isTarget = function({ taskId, variationId, commandId }, ids) {
  return ids.some(id => taskId === id || variationId === id || commandId === id)
}

const getPercentage = function({ percentage }) {
  return percentage
}
