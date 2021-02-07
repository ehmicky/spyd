import now from 'precise-now'
import randomItem from 'random-item'

import { setBenchmarkEnd, setPercentage } from '../preview/set.js'
import { getSum } from '../stats/sum.js'

import { getRemainingCombinations } from './remaining.js'

// Retrieve the next combination which should be measured.
// We do it based on which combination are been measured the least.
// At the beginning, we pick them randomly, because it looks nicer.
export const getNextCombination = function ({
  combinations,
  duration,
  exec,
  previewState,
  stopState,
}) {
  const remainingCombinations = getRemainingCombinations({
    combinations,
    duration,
    exec,
    stopState,
  })
  updateBenchmarkEnd({
    combinations,
    remainingCombinations,
    previewState,
    duration,
  })

  if (remainingCombinations.length === 0) {
    return
  }

  const minCombinations = getMinCombinations(remainingCombinations)
  const combination = randomItem(minCombinations)
  return combination
}

// Update the benchmark end in preview.
// When a combination ends, we do not include its remaining duration anymore.
// This allows `benchmarkEnd` to adjust progressively at the end of the
// benchmark as each combination ends.
// This also allows updating the progress bar duration to `0s` when the
// benchmark is stopped or errors.
const updateBenchmarkEnd = function ({
  combinations,
  remainingCombinations,
  previewState,
  duration,
}) {
  if (duration === 0) {
    return
  }

  if (duration === 1) {
    setBenchmarkPercentage(combinations, remainingCombinations, previewState)
    return
  }

  const timeLeft = getSum(
    remainingCombinations.map((combination) =>
      getCombinationTimeLeft(combination, duration),
    ),
  )
  const benchmarkEnd = now() + timeLeft
  setBenchmarkEnd(previewState, benchmarkEnd)
}

const setBenchmarkPercentage = function (
  combinations,
  remainingCombinations,
  previewState,
) {
  const percentage = 1 - remainingCombinations.length / combinations.length
  setPercentage(previewState, percentage)
}

const getCombinationTimeLeft = function ({ totalDuration }, duration) {
  return Math.max(duration - totalDuration, 0)
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
