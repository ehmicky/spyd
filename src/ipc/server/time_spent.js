import now from 'precise-now'
import randomItem from 'random-item'

export const getSampleStart = function () {
  return now()
}

export const addTimeSpent = function (combination, sampleStart) {
  const sampleDuration = now() - sampleStart
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  combination.timeSpent += sampleDuration
}

export const getNextCombination = function (combinations) {
  const minCombinations = getMinCombinations(combinations)
  const combination = randomItem(minCombinations)
  return combination
}

const getMinCombinations = function (combinations) {
  const minTimeSpent = getMinTimeSpent(combinations)
  return combinations.filter(({ timeSpent }) => timeSpent === minTimeSpent)
}

const getMinTimeSpent = function (combinations) {
  return Math.min(...combinations.map(getTimeSpent))
}

const getTimeSpent = function ({ timeSpent }) {
  return timeSpent
}
