import { isPreciseEnough } from '../precision.js'
import { hasMaxMeasures } from '../sample/max_measures.js'

// Check if combination should keep being measured.
// We measure each combination:
//  - At least once
//  - Exactly once when using either the `dev` command or `precision: 0`
//  - Until a specific `rmoe` (as defined by `precision`) has been reached
//    otherwise
// We always wait for calibration, except with the `dev` command.
// `median: 0`:
//  - Should very rarely happen after calibration since it requires all of:
//     - Very important change of performance between samples
//     - Task real median is very close to time resolution
//     - The `repeat` logic is failing to correct it
//  - We never stop measuring since `median: 0` is not useful and should not be
//    saved nor reported (including in previews)
// Measuring is interrupted when:
//  - User manually stopped it
//  - There are too many measures, which could lead to memory crash otherwise
// A combination does not time out even when very slow because:
//  - This allows `precision: 0` to be used to measure each combination once
//  - Timing out requires killing process, which might skip some resources
//    cleanup (afterEach and afterAll)
//  - Any timeout might trigger or not depending on the machine speed, which
//    means a benchmark might succeed or not depending on the machine.
export const isRemainingCombination = function (
  { sampleState: { allSamples, measures }, stats: { median, loops, rmoe } },
  { precisionTarget, stage, stopState: { stopped } },
) {
  if (stopped) {
    return false
  }

  if (stage === 'dev') {
    return allSamples === 0
  }

  if (median === 0) {
    return true
  }

  return shouldKeepRunning({ measures, loops, rmoe, precisionTarget })
}

const shouldKeepRunning = function ({
  measures,
  loops,
  rmoe,
  precisionTarget,
}) {
  if (hasMaxMeasures(measures)) {
    return false
  }

  if (precisionTarget === 0) {
    return loops === 0
  }

  return !isPreciseEnough(rmoe, precisionTarget)
}
