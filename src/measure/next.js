import now from 'precise-now'
import randomItem from 'random-item'

import { combinationHasErrored } from '../error/combination.js'
import { setBenchmarkEnd } from '../progress/set.js'
import { getSum } from '../stats/sum.js'

import { getSampleStart } from './duration.js'

// Retrieve the next combination which should be measured.
// We do it based on which combination are been measured the least.
// At the beginning, we pick them randomly, because it looks nicer.
export const getNextCombination = function ({
  combinations,
  progressState,
  stopState,
  combinationMaxLoops,
}) {
  const sampleStart = getSampleStart()
  const remainingCombinations = getRemainingCombinations(
    combinations,
    combinationMaxLoops,
    stopState,
  )
  updateBenchmarkEnd(remainingCombinations, progressState)

  if (remainingCombinations.length === 0) {
    return
  }

  const minCombinations = getMinCombinations(remainingCombinations)
  const combination = randomItem(minCombinations)
  // eslint-disable-next-line fp/no-mutation
  combination.sampleStart = sampleStart
  return combination
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
// Combination durations does not include the duration spent starting, ending
// nor exiting them because:
//  - Adding imports to a task should not change the task's number of samples
//  - Adding slow-to-start tasks should not change other tasks number of samples
const getRemainingCombinations = function (
  combinations,
  combinationMaxLoops,
  stopState,
) {
  if (shouldEndMeasuring(combinations, stopState)) {
    return []
  }

  return combinations.filter((combination) =>
    isRemainingCombination(combination, combinationMaxLoops),
  )
}

// When any combination errors, we end measuring.
// We also do this when the user stopped the benchmark (e.g. with CTRL-C).
// We still perform each combination ends and exits, for cleanup.
const shouldEndMeasuring = function (combinations, { stopped }) {
  return stopped || combinations.some(combinationHasErrored)
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

// Update the benchmark end in the progress reporting.
// When a combination ends, we do not include its remaining duration anymore.
// This allows `benchmarkEnd` to adjust progressively at the end of the
// benchmark as each combination ends.
// This also allows updating the progress duration to `0s` when the benchmark
// is stopped or errors.
// If a task is slower than its `duration`, `benchmarkEnd` might increase. In
// that case, we make `benchmarkEnd` freeze for a moment instead of making it
// jump up.
const updateBenchmarkEnd = function (remainingCombinations, progressState) {
  const remainingDuration = getSum(
    remainingCombinations.map(getRemainingDuration),
  )
  const benchmarkEnd = now() + remainingDuration
  setBenchmarkEnd(progressState, benchmarkEnd)
}

const getRemainingDuration = function ({ maxDuration, totalDuration }) {
  return Math.max(maxDuration - totalDuration, 0)
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
