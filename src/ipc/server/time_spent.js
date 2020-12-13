import now from 'precise-now'

export const setSampleStart = function (combination) {
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  combination.sampleStart = now()
}

export const addTimeSpent = function ({
  combination,
  combination: { sampleStart },
}) {
  if (sampleStart === undefined) {
    return
  }

  const sampleDuration = now() - sampleStart
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  combination.timeSpent += sampleDuration
}

export const getMinCombinations = function (combinations) {
  const minTimeSpent = getMinTimeSpent(combinations)
  return combinations.filter(({ timeSpent }) => timeSpent === minTimeSpent)
}

const getMinTimeSpent = function (combinations) {
  return Math.min(...combinations.map(getTimeSpent))
}

const getTimeSpent = function ({ timeSpent }) {
  return timeSpent
}
