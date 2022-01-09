import { UserError } from '../error/main.js'

// Normalize `precision` configuration property value.
// Also validates it.
// For each of those `precision` original value, each combination stops once
// its `rmoe` reached the corresponding `precision` normalized value.
// There are several advantages in using `precision` instead of a `duration`:
//  - A `duration` makes the precision (`rmoe`) machine-dependent or
//    hardward load-dependent
//     - This problem would be lessened (but not removed) by slower tasks
//       tending to have lower stdev
//  - Two combinations with same `rmoe` (than with same `duration`) are more
//    statically comparable
//  - This makes the results independent from the duration to start or end
//    the task.
//     - Otherwise the task's number of samples would be influenced by adding
//       more `import` for example.
//     - Note: if a `duration` was used instead, this could also be solved by
//       excluding start|end
//  - This makes each combination results independent from each other
//     - Adding/removing combinations should not change the duration/results of
//       others
//        - This includes using the `select` configuration properties
//     - Note: if a `duration` was used instead, this could also be solved by
//       making it combination-specific
// We only optimize the `rmoe` of the current combination in the current run.
//  - We do not try to maximize the precision of comparing either:
//     - With a previous result of the same combination (`stats.diff`)
//     - With other combinations in the same run (e.g. with Mann-Whitney U-test)
//  - This is because:
//     - Combinations being too close to be compared is interesting in itself,
//       since this indicates to user that they are not comparable
//     - At that level of closeness, measuring longer to know which one is
//       faster is too influenced by environment variation
//     - In a perfect environment, if the combinations are identical, they would
//       always be too close to stop measuring.
//     - This allows computing `precision` independently in each combination
// There are several types of variation:
//  - statistical:
//     - due to low sample size
//     - reduced by increasing `precision`
//        - users should increase `precision` up until a satisfactory precision
//          or a duration too slow
//     - types:
//        - same combination, same result: `rmoe`
//        - different combination, same result: compare `moe` ranges
//           - a Mann-Whitney U-test would be more statistically significant
//             but harder to report
//        - same combination, different results: same
//  - task itself:
//     - due to non-deterministic logic in the task or use a shared resources
//       (CPU, memory, etc.)
//     - measured by `stdev` and `quantiles|min|median|max`
//     - no way (nor reason) to reduce it
//     - only reported by distribution-centric reporters (histogram, box chart),
//       not most reporters
//        - reason: simplicity, and putting focus on `mean` instead
//  - engine optimization:
//     - due to engine optimize code runtime, e.g. JIT
//     - measured by `cold`
//     - reduced by increasing `precision`
//     - only happening in:
//        - the beginning of the measuring
//        - very fast tasks
//  - environment:
//     - difference in OS load, hardware, etc.
//        - multidimensional: CPU, memory, network, i.e. specific to each
//          combination use of those resources
//     - measured by:
//        - `envDev`: within a specific run
//        - `diff`: between runs
//     - reduced by using containers, VM, CI
//     - users might intentionally compare it, for example to compare different
//       machines
//        - this can happen inside the same run (due to previous runs being
//          merged to current one)
export const normalizePrecision = function (precision, propName) {
  if (!Number.isInteger(precision)) {
    throw new UserError(
      `'${propName}' must be a positive integer: ${precision}`,
    )
  }

  const precisionA = PRECISION_TARGETS[precision]

  if (precisionA === undefined) {
    throw new UserError(
      `'${propName}' must be between ${MIN_PRECISION} and ${MAX_PRECISION}, not ${precision}`,
    )
  }

  return { [propName]: precisionA }
}

// Associates `precision` (using array index) to the minimum `rmoe` each
// combination must reach.
// The number of values must be:
//  - High enough so that users can find a perfect value close enough
//  - Low enough for simplicity
// The lowest and highest are the extreme, with `0` having special semantics.
// The middle one is the default.
const PRECISION_TARGETS = [
  // eslint-disable-next-line no-magic-numbers
  0, 1, 2e-1, 5e-2, 2e-2, 1e-2, 3e-3, 1e-3, 3e-4, 1e-4, 1e-5,
]
const MIN_PRECISION = 0
const MAX_PRECISION = PRECISION_TARGETS.length - 1

// When there are not enough loops, the `stdev` is too imprecise so we leave it
// `undefined`.
// This applies to all derived stats, including `rmoe`.
// This means:
//  - Any benchmark must run a minimum amount:
//     - This prevents against early exits due to imprecise `stdev` at the
//       beginning
//     - This ensures cold starts do not impact mean too much
//     - Exception: when using `precision: 0`
//  - Until reaching that threshold:
//     - The following are not reported:
//        - `stdev` and related stats
//        - Preview `durationLeft`
//     - This also means those are never reported if `precision: 0`
// We also check that performance optimization has ended
//  - We compare `cold` to the same threshold to do so.
export const isPreciseEnough = function (rmoe, cold, precision) {
  return (
    rmoe !== undefined &&
    rmoe <= precision &&
    cold !== undefined &&
    cold <= precision
  )
}
