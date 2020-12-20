import randomItem from 'random-item'

import { updateBenchmarkEnd } from './duration.js'

// Retrieve the next combination which should be measured.
// We do it based on which combination are been measured the least.
// At the beginning, we pick them randomly, because it looks nicer.
export const getNextCombination = function (combinations, progressState) {
  const remainingCombinations = combinations.filter(isRemainingCombination)

  updateBenchmarkEnd(remainingCombinations, progressState)

  if (remainingCombinations.length === 0) {
    return
  }

  const minCombinations = getMinCombinations(remainingCombinations)
  const combination = randomItem(minCombinations)
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
// Combination durations does not include the duration spent loading nor exiting
// them because:
//  - Adding imports to a task should not change the task's number of samples
//  - Adding slow-to-load tasks should not change other tasks number of samples
const isRemainingCombination = function ({
  totalDuration,
  maxDuration,
  sampleDurationMean,
  loops,
}) {
  return (
    loops < MAX_LOOPS &&
    (sampleDurationMean === undefined ||
      totalDuration + sampleDurationMean < maxDuration)
  )
}

// We stop running samples when the `measures` is over `MAX_LOOPS`. This
// is meant to prevent memory overflow.
// The default limit for V8 in Node.js is 1.7GB, which allows measures to hold a
// little more than 1e8 floats.
const MAX_LOOPS = 1e8

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
