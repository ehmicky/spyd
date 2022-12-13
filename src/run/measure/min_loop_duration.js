import now from 'precise-now'
import timeResolution from 'time-resolution'

import { getSortedMedian } from '../../stats/quantile.js'
import { pWhile } from '../../utils/p_while.js'
import { measureSample } from '../sample/main.js'
import { hasMaxMeasures } from '../sample/max_measures.js'
import { getInitialSampleState } from '../sample/state.js'

// `measureCost` is the duration spent by the runner performing any benchmarking
// logic before and after each task such as computing timestamps.
//  - When the task duration is too close to `measureCost`, it becomes
//    impossible to distinguish them. The overall stats become both imprecise
//    and inaccurate.
//  - We fix this by running a `for` loop so the `measureCost` runs only once
//    for several task executions.
//  - Using this `for` loop decreases the number of samples:
//     - This decreases the accuracy of most statistics including `median`,
//       `stdev`, `moe`, `histogram`, `quantiles`, `min`, `max`
//     - This reduces the benefits of outliers removal
//     - Therefore, we want to minimize the loop size, while still making sure
//       it is high enough to remove the problem with the `measureCost`.
//  - For many tasks, this number might even be 1, i.e. no `repeat` loop.
//    The `repeat` loop is only useful for very fast tasks.
// Computing the optimal loop size is done automatically
//  - This is because it is highly dependent on the current machine speed which
//    both the user and the runner cannot specify as well as programmatic logic.
//  - It is passed as as `repeat` payload property to each runner sample.
//  - This payload property is based on a `minLoopDuration` which is the minimal
//    duration each `repeat` loop should last.
//  - `minLoopDuration` is based on `measureCost`.
// `measureCost` must be computed separately for each combination since it might
// vary depending on the task, system or runnerConfig.
// `measureCost` is computed before the combination starts being measured, as
// opposed to while measuring it:
//  - This ensures it is accurate when calibrating the sample
//  - This prevents its computation from influencing the measured task stats,
//    due to de-optimizing it
//  - This also prevents the opposite, which means changing the tasks logic
//    should not impact `measureCost`
export const getMinLoopDuration = async ({ server, stage }) => {
  if (stage === 'dev') {
    return
  }

  const { measures } = await getMeasureCost(server)
  const minLoopDuration = computeMinLoopDuration(measures)
  return minLoopDuration
}

// Repeatedly measure samples to estimate `measureCost`
// We run samples with `repeat: 0` because:
//  - It ensures the same measuring logic is used
//  - It warms the measuring logic, removing cold starts, which makes it more
//    precise
//  - It does not require any additional implementation in the runner
// `minLoopDuration: 0` is passed so the measuring logic knows `measureCost` is
// being estimated, and that `repeat: 0` should then be used.
// Runners should correctly handle `repeat: 0`:
//  - Every logic should execute except the task itself
//  - Nothing should be printed to `stdout` nor `stderr`
const getMeasureCost = async (server) => {
  const sampleState = getInitialSampleState()
  const end = now() + TARGET_DURATION
  return await pWhile(
    shouldKeepMeasuring.bind(undefined, end),
    measureSample.bind(undefined, {
      server,
      minLoopDuration: 0,
      targetSampleDuration: TARGET_SAMPLE_DURATION,
    }),
    sampleState,
  )
}

const shouldKeepMeasuring = (end, { measures }) =>
  !hasMaxMeasures(measures) && !(hasEnoughMeasures(measures) && now() >= end)

// We need enough measures so that both `measureCost` and `resolution` are
// precise.
// For `resolution`, the `0` measures are not useful, so we ensure at least
// `MIN_TIMES` non-`0` measures are available
//  - Since `measures` is sorted, we can do this by accessing the n-th last
//    element
// This check is mostly needed when either:
//  - The time resolution is very high
//  - The task is very slow
const hasEnoughMeasures = (measures) =>
  measures.length >= MIN_TIMES && measures[measures.length - MIN_TIMES] !== 0

// A higher value makes it more likely for the `measureCost` estimation to last
// too long.
// A lower value makes it more likely that `measureCost` or `resolution` would
// be imprecise if very high.
const MIN_TIMES = 5

// How long the runner should estimate the `measureCost`.
// This value should be as high as possible since:
//  - It makes the result more precise, especially reducing the probability of
//    an abnormally much slower result.
//  - It warms up the runner logic longer making the main measuring more precise
//  - If `measureCost` gets faster over time due to engine optimization, it
//    makes the estimation closer to it
//  - It is better at handling a high time `resolution`
// The only limit is how long users should wait.
// We use a duration because:
//  - The only limit is the user perception of how long this takes, which is
//    better expressed with a duration.
//  - This is better at handling a high time `resolution`
//  - This is better at handling a slow `measureCost`
// We use a constant value because:
//  - This avoids different `precision` impacting the `repeat`
//  - This avoids differences due to some engines optimizing functions after
//    repeating them a specific amount of times
//     - This is often engine/runtime/compiler-specific, not OS-specific
//     - For example, in Node.js `process.hrtime()` with V8, there are ~3 such
//       thresholds which trigger at relatively stable amounts of times and
//       speed up functions a lot
//     - This means the `moe` might incorrectly look low before the next
//       threshold is reached. This prevents us from using `moe` instead of
//       a duration.
// It is important for the `measureCost` estimate to be precise:
//  - This is because it determines the `minLoopDuration`, therefore the
//    `repeat` precision. `repeat` changes a combination's stats
//  - Stats stabilize around a specific `repeat` range
//     - Except `max`, which always decreases with higher value
//     - The lower part of that range has better overall stats, notably `rmoe`
//  - `rmoe` is very low when `repeat` is very low (1-5) and task is very fast,
//    due to `measureCost` becoming what's measured instead. However, this
//    low `rmoe` is not desirable in that case.
//  - `measureCost` is usually fast and highly optimized, making it very
//    variable by nature.
const TARGET_DURATION = 1e8
// How many samples should be used, approximately
// Lower values lead to more precise results since it increases the target
// sample duration. However, this precision is lost when the value is too low.
const TARGET_SAMPLE_COUNT = 10
// Mean duration of each sample
const TARGET_SAMPLE_DURATION = TARGET_DURATION / TARGET_SAMPLE_COUNT

const computeMinLoopDuration = (measures) => {
  const minMeasureCost = getMinMeasureCost(measures)
  const minResolution = getMinResolution(measures)
  return Math.max(minMeasureCost, minResolution)
}

// We use a median instead of a mean because:
//  - It is more precise by being more resistent against slow outliers
//  - The "typical" `measureCost` per loop is more important than the worst
//    case ones
const getMinMeasureCost = (measures) =>
  getSortedMedian(measures) * MEASURE_COST_RATIO

// How many times slower each repeat loop must last compared to `measureCost`.
// A lower value makes loops duration too close to `measureCost`, which
// decreases the quality and precision of all stats.
// A higher value decrease the stats quality, although not as much.
// Therefore, we use the smallest value that removes the `measureCost` influence
// enough.
const MEASURE_COST_RATIO = 1e2

// Just like `measureCost`, if the task duration is too close to the minimum
// time resolution, the stats will be imprecise
//  - Therefore we apply the same logic as `measureCost`.
// We need to use timestamps/durations computed in the runner, not the parent:
//  - This is because the runner (or its language/platform) resolution can be
//    different from the OS
//  - We re-use the `measures` used for `measureCost` for convenience
// If `measureCost` is lower than `resolution`, some measures might be `0`
//  - However, `resolution` will then be used to compute `minLoopDuration`
//    thanks to the `Math.max()` logic, so this is not a problem.
const getMinResolution = (measures) =>
  timeResolution(measures) * RESOLUTION_RATIO

// Like `MEASURE_COST_RATIO` but for `resolution`.
// We use a higher ratio because:
//  - `measureCost` influence is proportional to its stdev, not its mean.
//    However, for resolution, the whole unit granularity has an impact.
//  - When `measureCost` is close to `resolution`, any variation of it is
//    coarser. For example 2ns +|-1ns is 50% stdev.
//     - A higher resolution ratio removes that problem when
//       measureCost * MEASURE_COST_RATIO < resolution * RESOLUTION_RATIO
//     - I.e. with a `resolution` ratio 10 times higher, a single resolution
//       unit change in `measureCost` cannot increase|decrease `stdev` by more
//       than 10%
//  - This provides with 3 significant digits in reporting
const RESOLUTION_RATIO = 1e3
