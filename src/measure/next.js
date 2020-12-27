import randomItem from 'random-item'

import { combinationHasErrored } from '../error/combination.js'

import { updateBenchmarkEnd } from './duration.js'

// Retrieve the next combination which should be measured.
// We do it based on which combination are been measured the least.
// At the beginning, we pick them randomly, because it looks nicer.
export const getNextCombination = function (
  combinations,
  progressState,
  combinationMaxLoops,
) {
  const remainingCombinations = getRemainingCombinations(
    combinations,
    combinationMaxLoops,
  )
  updateBenchmarkEnd(remainingCombinations, progressState)

  if (remainingCombinations.length === 0) {
    return
  }

  const minCombinations = getMinCombinations(remainingCombinations)
  const combinationA = randomItem(minCombinations)
  return combinationA
}

// Filters out any combinations with no `duration` left
// We ensure each combination is measured at least once by checking
// `sampleDurationMean === undefined`.
// We do not time out combinations even when slower than the `duration`
// configuration property:
//  - Timing out requires killing process, which might skip some resources
//    cleanup (afterEach and afterAll)
//  - The `duration` might be adjusted for a specific machine that is faster
//    than others. This might make slower machines time out.
//  - This allows `duration: 0` to be used to measure each combination once
// Combination durations does not include the duration spent starting, stopping
// nor exiting them because:
//  - Adding imports to a task should not change the task's number of samples
//  - Adding slow-to-start tasks should not change other tasks number of samples
const getRemainingCombinations = function (combinations, combinationMaxLoops) {
  if (shouldStopMeasuring(combinations)) {
    return []
  }

  return combinations.filter((combination) =>
    isRemainingCombination(combination, combinationMaxLoops),
  )
}

// When any combination errors, we stop measuring. We still perform each
// combination stops and exits, for cleanup.
const shouldStopMeasuring = function (combinations) {
  return combinations.some(combinationHasErrored)
}

const isRemainingCombination = function (
  { totalDuration, maxDuration, sampleDurationMean, loops },
  combinationMaxLoops,
) {
  return (
    loops < combinationMaxLoops &&
    (sampleDurationMean === undefined ||
      totalDuration + sampleDurationMean < maxDuration)
  )
}

// The `duration` configuration property is for each combination, not the whole
// benchmark. Otherwise:
//  - Adding/removing combinations would change the duration (and results) of
//    others
//  - This includes using the `include|exclude` configuration properties
const getMinCombinations = function (combinations) {
  const minCombinationDuration = getMinDuration(combinations)
  return combinations.filter(
    (combination) => getTotalDuration(combination) === minCombinationDuration,
  )
}

const getMinDuration = function (combinations) {
  return Math.min(...combinations.map(getTotalDuration))
}

const getTotalDuration = function ({ totalDuration }) {
  return totalDuration
}
