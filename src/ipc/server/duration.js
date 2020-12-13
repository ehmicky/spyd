import now from 'precise-now'
import randomItem from 'random-item'

// Compute when benchmark should end.
// The `duration` configuration property is for each combination, not the whole
// benchmark. Otherwise:
//  - Adding/removing combinations would change the duration (and results) of
//    others
//  - This includes using the `include|exclude` configuration properties
export const getBenchmarkEnd = function (combinations, duration) {
  const benchmarkDuration = combinations.length * duration
  return now() + benchmarkDuration
}

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

export const getRemainingCombinations = function (combinations, benchmarkEnd) {
  const benchmarkDurationLeft = benchmarkEnd - now()
  return combinations.filter((combination) =>
    isRemainingCombination(combination, benchmarkDurationLeft),
  )
}

// `sampleDurationMean` is initially `undefined`. This ensures each combination
// runs at least once sample.
const isRemainingCombination = function (
  { state: { sampleDurationMean } },
  benchmarkDurationLeft,
) {
  return (
    sampleDurationMean === undefined ||
    sampleDurationMean < benchmarkDurationLeft
  )
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
