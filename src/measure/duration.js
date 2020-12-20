import now from 'precise-now'
import randomItem from 'random-item'

// Compute when the benchmark should end.
// The `duration` configuration property is for each combination, not the whole
// benchmark. Otherwise:
//  - Adding/removing combinations would change the duration (and results) of
//    others
//  - This includes using the `include|exclude` configuration properties
export const getBenchmarkEnd = function (combinations, duration) {
  const benchmarkDuration = combinations.length * duration
  return now() + benchmarkDuration
}

// We keep track of:
//  - The total duration spent on each combination, to know whether it should
//    keep being measured.
//  - The mean duration of a sample, to know whether measuring an additional
//    sample would fit within the allowed `duration`
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

// Filters out any combinations with no `duration` left
export const getRemainingCombinations = function (combinations, benchmarkEnd) {
  const benchmarkDurationLeft = benchmarkEnd - now()
  return combinations.filter((combination) =>
    isRemainingCombination(combination, benchmarkDurationLeft),
  )
}

// `sampleDurationMean` is initially `undefined`. This ensures each combination
// measures at least once sample.
const isRemainingCombination = function (
  { state: { sampleDurationMean, loops } },
  benchmarkDurationLeft,
) {
  return (
    loops < MAX_LOOPS &&
    (sampleDurationMean === undefined ||
      sampleDurationMean < benchmarkDurationLeft)
  )
}

// We stop running samples when the `measures` is over `MAX_LOOPS`. This
// is meant to prevent memory overflow.
// The default limit for V8 in Node.js is 1.7GB, which allows measures to hold a
// little more than 1e8 floats.
const MAX_LOOPS = 1e8

// Retrieve the next combination which should be measured.
// We do it based on which combination are been measured the least.
// At the beginning, we pick them randomly, because it looks nicer.
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
