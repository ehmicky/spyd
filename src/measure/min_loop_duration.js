import now from 'precise-now'
import timeResolution from 'time-resolution'

import { measureSample } from '../sample/main.js'
import { hasMaxMeasures, getInitialSampleState } from '../sample/state.js'
import { getUnsortedMedian } from '../stats/median.js'

// This is used to compute `measureCost` and `resolution`, which are used for
// `repeat`.
// We run samples with `repeat: 0` because:
//  - It ensures the same measuring logic is used
//  - It warms the measuring logic, removing cold starts, which makes it more
//    precise
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
//  - Those return an empty array of `measures`, making them not use any
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
// `minLoopDuration` is estimated based on an array of `measures`:
//  - Each `measure` is the duration to compute timestamps
//  - This must be computed separately for each combination since they might
//    vary depending on the task, system or runnerConfig
//  - This results in more difference between the `repeat` of combinations of a
//    given result, but in less difference between the average `repeat` of
//    combinations of several results
// `measures` is computed by the runner at start time because:
//  - This is simpler to implement for both the runner and the parent
//  - This prevents its computation from de-optimizing the measured task
//  - The median more stable as the `config` and tasks change
// `measures` should filter out any `0`, while still filling a specific
// length specified by the parent process.
//  - This prevents computation errors for both time `resolution` and
//    `measureCost`
//  - This means the computed `resolution` will never be slower than
//    `measureCost`. We still compute `resolution` for debugging purpose, or in
//    case the logic changes.
//  - If the real `resolution` is slower than `measureCost`, `measureCost` will
//    equal the real `resolution`, which is ok.
//  - If the `resolution` is slow, computing the `measures` might take
//    some duration. However, this is fine since this duration will be spent on
//    each sample anyway due to `minLoopDuration`.
// The precision of `minLoopDuration` is not very critical:
//  - The total number of `times` each step is run should be the same
//    regardless of `repeat`. This is because a lower|higher `repeat` is
//    balanced by `maxLoops` and `scale`.
//  - The `stats.median` is mostly not impacted by the `minLoopDuration`.
//  - `stats.mean|low|high|stdev|rstdev|moe|rmoe` are moderately impacted, but
//    not too much.
//  - `stats.min|max` are much more impacted, but those stats are not as
//    critical.
// If the minimum resolution is too close to the measures, results will not be
// precise enough:
//  - We apply the same `repeat` loop method as for `measureCost` to prevent
//    this.
//  - The runner's resolution is the granularity of timestamps and measures.
//  - This can be different from the OS resolution as the runner (or its
//    language/platform) might have a lower resolution.
//  - We use `time-resolution` to guess the runner's minimum resolution.
//  - For example, if a runner can only measure things with 1ms precision, every
//    nanoseconds measures will be a multiple of 1e6.
export const getMinLoopDuration = async function (taskId, server, res) {
  if (taskId === undefined) {
    return { res }
  }

  const { measures, res: resA } = await measureInLoop(server, res)
  const minLoopDuration = computeMinLoopDuration(measures)
  return { minLoopDuration, res: resA }
}

const measureInLoop = async function (server, res) {
  const end = now() + TARGET_DURATION
  // eslint-disable-next-line fp/no-let
  let sampleState = getInitialSampleState()
  // eslint-disable-next-line fp/no-let
  let resA = res

  // eslint-disable-next-line fp/no-loops
  do {
    // eslint-disable-next-line no-await-in-loop
    const { res: resB, sampleState: sampleStateA } = await measureSample({
      sampleState,
      server,
      res: resA,
      minLoopDuration: 0,
      targetSampleDuration: TARGET_SAMPLE_DURATION,
    })
    // eslint-disable-next-line fp/no-mutation
    sampleState = sampleStateA
    // eslint-disable-next-line fp/no-mutation
    resA = resB
  } while (now() < end && !hasMaxMeasures(sampleState))

  return { measures: sampleState.measures, res: resA }
}

// How long the runner should estimate the `measureCost`.
// We use a hardcoded duration because:
//  - This must be as high as possible to make the `minLoopDuration` precise.
//    The only limit is the user perception of how long this takes, which is
//    better expressed with a hardcoded duration.
//  - This works even with high time resolution, providing it is high enough
//  - This works even when the duration to take each item is very slow,
//    providing it is high enough
//  - This avoid different `precision` impacting the `repeat`
//  - This avoids differences due to some engines like v8 which optimize the
//    speed of functions after repeating them a specific amount of times
const TARGET_DURATION = 1e8
// Mean duration of each sample
const TARGET_SAMPLE_DURATION = 1e7

const computeMinLoopDuration = function (measures) {
  const measureCost = getUnsortedMedian(measures)
  const resolution = timeResolution(measures)
  return Math.max(resolution, measureCost) * MIN_LOOP_DURATION_RATIO
}

// How many times slower each repeat loop iteration must be compared to
// `measureCost` or `resolution`.
// Ensure `repeat` is high enough to decrease the impact of `measureCost` or
// `resolution`.
// We use a single ratio for both `resolution` and `measureCost`.
// A lower value decreases precision.
// A higher value increases the task loop duration, creating fewer loops.
const MIN_LOOP_DURATION_RATIO = 1e2
