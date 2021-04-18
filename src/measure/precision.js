import { UserError } from '../error/main.js'

// Replaces `precision` configuration property by `precisionTarget`.
// Also validates it.
// For each of those `precision` values, each combination stops once its `rmoe`
// reached the corresponding `precisionTarget`.
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
export const normalizePrecision = function (precision, name) {
  if (!Number.isInteger(precision)) {
    throw new UserError(`'${name}' must be a positive integer: ${precision}`)
  }

  const precisionTarget = PRECISION_TARGETS[precision]

  if (precisionTarget === undefined) {
    throw new UserError(
      `'${name}' must be between ${MIN_PRECISION} and ${MAX_PRECISION}, not ${precision}`,
    )
  }

  return { precisionTarget }
}

// eslint-disable-next-line no-magic-numbers
const PRECISION_TARGETS = [0, 5e-2, 1e-2, 5e-3, 1e-3]
const MIN_PRECISION = 0
const MAX_PRECISION = PRECISION_TARGETS.length - 1

// `rmoe` is `undefined` when not enough loops are available to compute it.
export const isPreciseEnough = function (rmoe, precisionTarget) {
  return rmoe !== undefined && rmoe <= precisionTarget
}
