import now from 'precise-now'
import randomItem from 'random-item'

export const getSampleStart = function () {
  return now()
}

export const addSampleDuration = function ({ state }, sampleStart) {
  const sampleDuration = now() - sampleStart
  const combinationDuration = state.combinationDuration + sampleDuration
  const processes = state.processes + 1
  const sampleDurationMean = combinationDuration / processes

  // eslint-disable-next-line fp/no-mutating-assign
  Object.assign(state, { combinationDuration, processes, sampleDurationMean })
}

export const getNextCombination = function (combinations) {
  const minCombinations = getMinCombinations(combinations)
  const combination = randomItem(minCombinations)
  return combination
}

const getMinCombinations = function (combinations) {
  const minCombinationDuration = getMinDuration(combinations)
  return combinations.filter(
    (combination) =>
      getCombinationDuration(combination) === minCombinationDuration,
  )
}

const getMinDuration = function (combinations) {
  return Math.min(...combinations.map(getCombinationDuration))
}

const getCombinationDuration = function ({ state: { combinationDuration } }) {
  return combinationDuration
}
