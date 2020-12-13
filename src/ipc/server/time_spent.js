import now from 'precise-now'
import randomItem from 'random-item'

export const getSampleStart = function () {
  return now()
}

export const addTimeSpent = function ({ state }, sampleStart) {
  const sampleDuration = now() - sampleStart
  const timeSpent = state.timeSpent + sampleDuration
  const processes = state.processes + 1
  const sampleDurationMean = timeSpent / processes

  // eslint-disable-next-line fp/no-mutating-assign
  Object.assign(state, { timeSpent, processes, sampleDurationMean })
}

export const getNextCombination = function (combinations) {
  const minCombinations = getMinCombinations(combinations)
  const combination = randomItem(minCombinations)
  return combination
}

const getMinCombinations = function (combinations) {
  const minTimeSpent = getMinTimeSpent(combinations)
  return combinations.filter(
    (combination) => getTimeSpent(combination) === minTimeSpent,
  )
}

const getMinTimeSpent = function (combinations) {
  return Math.min(...combinations.map(getTimeSpent))
}

const getTimeSpent = function ({ state: { timeSpent } }) {
  return timeSpent
}
