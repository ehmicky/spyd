import { OUTLIERS_THRESHOLD } from '../stats/outliers.js'
import { getSortedMedian } from '../stats/quantile.js'

import { measureProcessGroup } from './process_group.js'
import { getMinResolutionDuration } from './resolution.js'

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
//  - Those use `runner.repeat: false`, making them not use any `repeat` loop.
// Iterating the `repeat` loop adds a small duration, due to the time to
// increment the loop counter (e.g. 1 or 2 CPU cycles)
//  - We do not subtract that duration because it is variable, so would add to
//    the overall variance.
//  - Also measuring that duration is imperfect, which also adds variance
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
export const getMinLoopDuration = async function ({
  taskPath,
  taskId,
  inputId,
  commandSpawn,
  commandSpawnOptions,
  commandConfig,
  runnerRepeats,
  processGroupDuration,
  cwd,
  loadDuration,
}) {
  const { measures, measureCost } = await getMeasureCost({
    taskPath,
    taskId,
    inputId,
    commandSpawn,
    commandSpawnOptions,
    commandConfig,
    runnerRepeats,
    processGroupDuration,
    cwd,
    loadDuration,
  })
  const minMeasureCostDuration = measureCost * MIN_MEASURE_COST
  const minResolutionDuration = getMinResolutionDuration(measures)
  return Math.max(minResolutionDuration, minMeasureCostDuration)
}

// This function estimates `measureCost` by measuring an empty task.
// That cost must be computed separately for each combination since they might
// vary depending on:
//  - the task. Some runners might allow task-specific configuration impacting
//    measuring. For example, the `node` runner has the `async` configuration
//    property.
//  - the input. The size of the input or whether an input is used or not
//    might impact measuring.
//  - the system. For example, runConfig.
const getMeasureCost = async function ({
  taskPath,
  taskId,
  inputId,
  commandSpawn,
  commandSpawnOptions,
  commandConfig,
  runnerRepeats,
  processGroupDuration,
  cwd,
  loadDuration,
}) {
  const { measures } = await measureProcessGroup({
    sampleType: 'measureCost',
    taskPath,
    taskId,
    inputId,
    commandSpawn,
    commandSpawnOptions,
    commandConfig,
    runnerRepeats,
    processGroupDuration,
    cwd,
    loadDuration,
    measureCost: 0,
    resolution: 1,
    dry: true,
  })
  const measureCost = getSortedMedian(measures, OUTLIERS_THRESHOLD)
  return { measures, measureCost }
}

// How many times slower the repeated median must be compared to `measureCost`.
// Ensure `repeat` is high enough to decrease the impact of `measureCost`.
// A lower value decreases precision as the variance of `measureCost`
// contributes more to the overall variance.
// A higher value increases the task loop duration, creating fewer loops.
const MIN_MEASURE_COST = 1e2
