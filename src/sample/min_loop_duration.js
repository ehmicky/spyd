import timeResolution from 'time-resolution'

import { getUnsortedMedian } from '../stats/median.js'

// `measureCost` is the time taken to take a measurement.
// This includes the time to get the start/end timestamps for example.
// In order to minimize the impact of `measureCost` on measures:
//  - We run batches of measures at a time in a loop
//  - The `repeat` size of that loop is automatically guessed
//  - No loop is used if the task is too slow to be impacted by `measureCost`
// Some runners take a long time to call each task, e.g. by spawning processes:
//  - Those should not use any `repeat` loop, since that is meant to remove the
//    time to take timestamps, not the time to spawn processes.
//  - Also, `measureCost` would be too large, creating very large `repeat`.
//  - Those return an empty array for `emptyMeasures`, making them not use any
//    `repeat` loop.
// Iterating the `repeat` loop adds a small duration, due to the time to
// increment the loop counter (e.g. 1 or 2 CPU cycles)
//  - We do not subtract that duration because it is variable, so would lower
//    the overall precision.
//  - Also measuring that duration is imperfect, which also lowers precision
//  - Moreover, estimating that duration takes time and adds complexity
// Runners should minimize that loop counter duration. Using a simple "for" loop
// should be enough. Loop unrolling is an option but is tricky to get right and
// is probably not worth the effort:
//  - Functions with large loop unrolling might be deoptimized by compilers and
//    runtimes, or even hit memory limits. For example, in JavaScript, functions
//    with a few hundred statements are deoptimized. Also, `new Function()` body
//    has a max size.
//  - Parsing (as opposed to executing) the unrolled code should not be
//    measured. For example, in JavaScript, `new Function()` should be used,
//    not `eval()`.
// Calling each task also adds a small duration due to the time it takes to
// create a new function stack:
//  - However, this duration is experienced by end users, so should be kept
//  - Inlining could be used to remove this, but it is hard to implement:
//     - The logic can be short-circuited if the task uses things like `return`
//     - The task might contain reference to outer scopes (with lexical
//       scoping), which would be broken by inlining
//  - Estimating that duration is hard since compilers/runtimes would typically
//    remove that function stack when trying to benchmark an empty task
// Not using loop unrolling nor subtracting `measureCost` nor the time to
// iterate the `repeat` loop is better for precision, but worse for accuracy
// (this is tradeoff).
// Very fast functions might be optimized by compilers/runtimes:
//  - For example, simple tasks like `1 + 1` are often simply not executed
//  - Tricks like returning a value or assigning variables sometimes help
//    avoiding this
//  - The best way to benchmark those very fast functions is to increase their
//    complexity. Since the runner already runs those in a "for" loop, the only
//    thing that a task should do is increase the size of its inputs.
export const getMinLoopDuration = function (emptyMeasures) {
  if (emptyMeasures.length === 0) {
    return 0
  }

  const minMeasureCost = getMinMeasureCost(emptyMeasures)
  const minResolution = getMinResolution(emptyMeasures)
  return Math.max(minResolution, minMeasureCost)
}

// This function estimates `measureCost` by making runners do `emptyMeasures`.
// That cost must be computed separately for each combination since they might
// vary depending on the task, system or runnerConfig.
const getMinMeasureCost = function (emptyMeasures) {
  const measureCost = getUnsortedMedian(emptyMeasures)
  return measureCost * MIN_MEASURE_COST
}

// How many times slower each repeat loop iteration must be compared to
// `measureCost`.
// Ensure `repeat` is high enough to decrease the impact of `measureCost`.
// A lower value decreases precision as the lack of precision of `measureCost`
// contributes more to the overall lack of precision.
// A higher value increases the task loop duration, creating fewer loops.
const MIN_MEASURE_COST = 1e2

// If the minimum resolution is too close to the measures, results will not be
// precise enough. We apply the same `repeat` loop method as for `measureCost`
// to prevent this.
// The runner's resolution is the granularity of timestamps and measures.
// This can be different from the OS resolution as the runner (or its
// language/platform) might have a lower resolution.
// We use `time-resolution` to guess the runner's minimum resolution.
// For example, if a runner can only measure things with 1ms precision, every
// nanoseconds measures will be a multiple of 1e6.
// We estimate this using the `emptyMeasures`.
const getMinResolution = function (emptyMeasures) {
  const resolution = timeResolution(emptyMeasures)
  return resolution * MIN_RESOLUTION_PRECISION
}

// How many times slower the repeated median must be compared to the resolution.
// A lower value makes measures closer to the resolution, making them less
// precise.
// A higher value increases the task loop duration, creating fewer loops.
const MIN_RESOLUTION_PRECISION = 1e2
