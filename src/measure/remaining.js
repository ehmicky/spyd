import { hasMaxMeasures } from '../sample/state.js'

// Check if combination should keep being measured.
// We measure each combination:
//  - At least once
//  - Exactly once when using either the `exec` command or `precision: 0`
//  - Until a specific `rmoe` (as defined by `precision`) has been reached
//    otherwise
// We always wait for calibration, except with the `exec` command.
// A combination does not time out even when very slow because:
//  - This allows `precision: 0` to be used to measure each combination once
//  - Timing out requires killing process, which might skip some resources
//    cleanup (afterEach and afterAll)
//  - Any timeout might trigger or not depending on the machine speed, which
//    means a benchmark might succeed or not depending on the machine.
export const isRemainingCombination = function (
  { sampleState, sampleState: { allSamples }, stats: { loops, rmoe } },
  { precision, stage, stopState: { stopped } },
) {
  if (shouldInterrupt(stopped, sampleState)) {
    return false
  }

  if (stage === 'exec') {
    return allSamples === 0
  }

  if (precision === 0) {
    return loops === 0
  }

  return !isPreciseEnough(rmoe, precision)
}

// Measuring is interrupted when:
//  - User manually stopped it
//  - There are too many measures, which could lead to memory crash otherwise
const shouldInterrupt = function (stopped, sampleState) {
  return stopped || hasMaxMeasures(sampleState)
}

// There are several advantages in using `precision` instead of a `duration`:
//  - This makes the results independent from the duration to start or end
//    the task.
//     - Otherwise the task's number of samples would be influenced by adding
//       more `import` for example.
//     - Note: if a `duration` was used instead, this could also be solved by
//       excluding start|end
//  - This makes each combination results independent from each other
//     - Adding/removing combinations should not change the duration/results of
//       others
//        - This includes using the `include|exclude` configuration properties
//     - Note: if a `duration` was used instead, this could also be solved by
//       making it combination-specific
const isPreciseEnough = function (rmoe, precision) {
  return rmoe !== undefined && rmoe <= RMOE_TARGETS[precision]
}

// For each of those `precision` values, the combination stops once its `rmoe`
// reached the corresponding target.
// `rmoe` is `undefined` when not enough loops are available to compute it.
export const RMOE_TARGETS = {
  1: 5e-2,
  2: 1e-2,
  3: 5e-3,
  4: 1e-3,
}
