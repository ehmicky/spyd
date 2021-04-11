import now from 'precise-now'
import timeResolution from 'time-resolution'

import { measureSample } from '../sample/main.js'
import { hasMaxMeasures, getInitialSampleState } from '../sample/state.js'
import { getSortedMedian } from '../stats/quantile.js'
import { pWhile } from '../utils/p_while.js'

// `measureCost` is the duration spent by the runner performing any benchmarking
// logic before and after each task such as computing timestamps.
//  - When the task duration is too close to `measureCost`, it becomes
//    impossible to distinguish them. The overall stats become both imprecise
//    and inacurrate.
//  - We fix this by running a `for` loop so the `measureCost` runs only once
//    for several task executions.
//  - Using this `for` loop effectively applies an arithmetic mean, so it
//    reduces the benefits of using the median. Therefore, we want to minimize
//    the loop size, while still making sure it is high enough to remove the
//    problem with the `measureCost`.
//  - For many tasks, this number might even be 1, i.e. no `repeat` loop.
//    The `repeat` loop is only useful for very fast tasks.
// Computing the optimal loop size is done automatically
//  - This is because it is highly dependent on the current machine speed which
//    both the user and the runner cannot specify as well as programmatic logic.
//  - It is passed as as `repeat` parameter to each runner sample.
//  - This parameter is based on a `minLoopDuration` which is the minimal
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
export const getMinLoopDuration = async function (taskId, server, res) {
  if (taskId === undefined) {
    return { res }
  }

  const {
    sampleState: { measures },
    res: resA,
  } = await getMeasureCost(server, res)
  const minLoopDuration = computeMinLoopDuration(measures)
  return { minLoopDuration, res: resA }
}

// Repeatedly measure samples to estimate `measureCost`
// We run samples with `repeat: 0` because:
//  - It ensures the same measuring logic is used
//  - It warms the measuring logic, removing cold starts, which makes it more
//    precise
//  - It does not require any additional implementation in the runner
// `minLoopDuration: 0` is passed so the measuring logic knows `measureCost` is
// being estimated, and that `repeat: 0` should then be used.
const getMeasureCost = async function (server, res) {
  const sampleState = getInitialSampleState()
  const end = now() + TARGET_DURATION
  return await pWhile(
    shouldKeepMeasuring.bind(undefined, end),
    measureSample.bind(undefined, {
      server,
      minLoopDuration: 0,
      targetSampleDuration: TARGET_SAMPLE_DURATION,
    }),
    { res, sampleState },
  )
}

const shouldKeepMeasuring = function (end, { sampleState }) {
  return now() < end && !hasMaxMeasures(sampleState)
}

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

const computeMinLoopDuration = function (measures) {
  const measureCost = getSortedMedian(measures)
  const resolution = getResolution(measures)
  return Math.max(resolution, measureCost) * MIN_LOOP_DURATION_RATIO
}

// How many times slower each repeat loop must last compared to `measureCost` or
// `resolution`.
// We purposely use a single ratio for both `resolution` and `measureCost`.
// A lower value makes loops duration too close to `measureCost`, which
// decreases the quality and precision of all stats.
// A higher value makes the metrics rely on the arithmetic mean more than the
// median, which also decrease the stats quality, although not as much.
// Therefore, we use the smallest value that removes the `measureCost` influence
// enough.
const MIN_LOOP_DURATION_RATIO = 1e2

// Just like `measureCost`, if the task duration is too close to the minimum
// time resolution, the stats will be imprecise
//  - Therefore we apply the same logic as `measureCost`.
// We need to use timestamps/durations computed in the runner, not the parent:
//  - This is because the runner (or its language/platform) resolution can be
//    different from the OS
//  - We re-use the `measures` used for `measureCost` for convenience
const getResolution = function (measures) {
  return timeResolution(measures)
}
