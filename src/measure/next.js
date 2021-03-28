import now from 'precise-now'

import { setBenchmarkEnd, setPercentage } from '../preview/set.js'

import { getRemainingCombinations } from './remaining.js'

// Retrieve the next combination which should be measured.
// We do it based on which combination are been measured the least.
// At the beginning, we pick them randomly, because it looks nicer.
// The `duration` configuration property is for each combination, not the whole
// benchmark. Otherwise:
//  - Adding/removing combinations would change the duration (and results) of
//    others
//  - This includes using the `include|exclude` configuration properties
export const getNextCombination = function ({
  combinations,
  duration,
  exec,
  previewState,
  stopState,
}) {
  const [combination, ...remainingCombinations] = getRemainingCombinations({
    combinations,
    duration,
    exec,
    stopState,
  })
  const { length: remainingLength } = remainingCombinations
  updateBenchmarkEnd({
    combination,
    combinations,
    remainingLength,
    previewState,
    duration,
  })
  return combination
}

// Update the benchmark end in preview.
// When a combination ends, we do not include its remaining duration anymore.
// This allows `benchmarkEnd` to adjust progressively at the end of the
// benchmark as each combination ends.
// This also allows updating the progress bar duration to `0s` when the
// benchmark is stopped or errors.
const updateBenchmarkEnd = function ({
  combination,
  combinations,
  remainingLength,
  previewState,
  duration,
}) {
  if (duration === 1) {
    setBenchmarkPercentage({
      combination,
      combinations,
      remainingLength,
      previewState,
    })
    return
  }

  const combinationTimeLeft =
    combination === undefined
      ? 0
      : Math.max(duration - combination.totalDuration, 0)
  const timeLeft = combinationTimeLeft + remainingLength * duration
  const benchmarkEnd = now() + timeLeft
  setBenchmarkEnd(previewState, benchmarkEnd)
}

const setBenchmarkPercentage = function ({
  combination,
  combinations,
  remainingLength,
  previewState,
}) {
  const combinationsLeft = combination === undefined ? 0 : remainingLength + 1
  const percentage = 1 - combinationsLeft / combinations.length
  setPercentage(previewState, percentage)
}
