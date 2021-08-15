import { hasMaxMeasures } from '../sample/max_measures.js'

import { isPreciseEnough } from './precision.js'

// Check if combination should keep being measured.
// We measure each combination:
//  - At least once
//  - Exactly once when using either the `dev` command or `precision: 0`
//  - Until a specific `rmoe` (as defined by `precision`) has been reached
//    otherwise
// We always wait for calibration, except with the `dev` command.
// A combination does not time out even when very slow because:
//  - This allows `precision: 0` to be used to measure each combination once
//  - Timing out requires killing process, which might skip some resources
//    cleanup (afterEach and afterAll)
//  - Any timeout might trigger or not depending on the machine speed, which
//    means a benchmark might succeed or not depending on the machine.
export const isRemainingCombination = function (
  { sampleState: { allSamples, measures }, stats: { loops, rmoe } },
  { precisionTarget, stage, stopState: { stopped } },
) {
  if (shouldInterrupt(stopped, measures)) {
    return false
  }

  if (stage === 'dev') {
    return allSamples === 0
  }

  if (precisionTarget === 0) {
    return loops === 0
  }

  return !isPreciseEnough(rmoe, precisionTarget)
}

// Measuring is interrupted when:
//  - User manually stopped it
//  - There are too many measures, which could lead to memory crash otherwise
const shouldInterrupt = function (stopped, measures) {
  return stopped || hasMaxMeasures(measures)
}
