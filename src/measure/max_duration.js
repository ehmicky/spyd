import now from 'precise-now'

// `maxDuration` is the estimated duration a process will spend measuring.
// It is callibrated progressively based on several limits:
//  1. Must not be longer than the duration left in the task
//     (`measureDurationLeft`)
//  2. Must be at least long enough so that we don't spend duration only
//     spawning processes/runners instead of measuring. This is done by
//     estimating that `loadCost` and making `maxDuration` at least big enough
//     compared to it.
//  3. Must iterates with a minimal amount of loops per process. This is to
//     ensure cold starts do not impact measures.
// This means:
//   - Fast tasks are most likely duration-limited by `2.`. Since `loadCost`
//     mostly depends on the hardware speed, how long to load a given runner and
//     how long to load tasks files, this is rather stable between benchmarks.
//     A multiple of `loadCost` is then used as the target duration for
//     each process.
//   - Slow tasks are most likely duration-limited by `3.`. Their target
//     duration is computed to execute them a specific amount of times.
//   - As fast tasks get slower, their target duration based on `2.` becomes
//     closer to the target duration based on `3.`, ensuring a perfect
//     transition.
// The above algorithm has several goals:
//   - Ensures processes to roughly use the same `maxDuration` both inside a
//     specific benchmark and between benchmarks with different `duration`
//     configuration property.
//     Processes with different `maxDuration` might give different measures to
//     the runtime having optimized hot paths for longer durations.
//   - Ensures processes are short enough to provide with frequent realtime
//     reporting
//   - Ensures many processes are spawned to decrease the overall variance,
//     while still making sure enough loops are measured inside each of those
//     processes
// We pass a single `maxDuration` parameters for runners to know when to stop
// measuring
//   - We purposely avoid others like `maxTimes` or `minDuration` to keep it
//     simple for runners.
//   - This means `targetTimes` needs to be estimated, as opposed to simply
//     pass a target integer to runners as parameter.
// We purposely avoid using `processGroupDuration` (except for
// `measureDurationLeft`) so that increasing `duration` does not change measures
export const getMaxDuration = function ({
  processGroupEnd,
  loadCost,
  repeat,
  median,
}) {
  const measureDurationLeft = getMeasureDurationLeft(processGroupEnd, loadCost)
  const loadCostMin = getLoadCostMin(loadCost)
  const targetTimesMin = getTargetTimesMin(median)
  const loopDuration = getLoopDuration(median, repeat)
  return Math.max(
    Math.min(measureDurationLeft, Math.max(loadCostMin, targetTimesMin)) -
      loopDuration,
    1,
  )
}

// Time left for measuring (excluding how long to load the process/runner)
const getMeasureDurationLeft = function (processGroupEnd, loadCost) {
  return Math.max(processGroupEnd - now() - loadCost, 0)
}

// Ensure that processes are executed long enough (by using `maxDuration`) so
// that they get enough duration to measure the task, as opposed to spawning
// processes/runners.
const getLoadCostMin = function (loadCost) {
  return loadCost * (1 / LOAD_COST_RATIO - 1)
}

// How much duration should be spent spawning processes/runners as opposed to
// measuring the task.
// A lower number spawns fewer processes, reducing the precision provided by
// using several processes.
// A higher number measures the task fewer times, reducing the precision
// provided by measuring it many times.
const LOAD_COST_RATIO = 0.5

// Estimated duration to measure the task a specific amount of times.
// This is the number of times the task function is measured, not the `repeat`
// loop.
const getTargetTimesMin = function (median) {
  return TARGET_TIMES * median
}

// The process ends up with slightly fewer measures that the target due to:
//   - Using a median where an arithmetic mean would be more in this case.
//     However, due to cold starts, using an arithmetic mean makes
//     `targetTimesMin` vary too much. Also, at the beginning of the
//     combination, while `repeat` is still being callibrated, `targetTimesMin`
//     can be much larger than the real mean.
//   - Using the whole duration of the repeat loop instead of an
//     aggregation of the measures. The `median` do not completely capture the
//     duration spent measuring. For example, if two timestamps are taken at the
//     beginning|end, only half of them will be included in `median`. The other
//     half will not be reflected in the measures but will still be spent.
// Those concerns are stronger if either:
//   - The task has a strong cold start, whether because it memoizes a lot or
//     because the runtime optimizes it a lot later on.
//   - The task speed is close to `measureCost`
// However, stability is more important than accuracy for `targetTimesMin`.
// We slightly increase `TARGET_TIMES` to take this into account. This is rather
// imprecise so we keep this increase small.
const TARGET_TIMES_ADJUST = 1.1
// How many times tasks should be measured at a minimum inside each process.
// A lower number means cold starts induce more variance in final measures.
// A higher number means fewer processes are spawned, reducing their positive
// impact on variance.
const TARGET_TIMES = 10 * TARGET_TIMES_ADJUST

// We remove the `loopDuration` to guarantee runners stop right under the target
// duration, not right above.
// `loopDuration` is the duration for the runner to perform a single repeat loop
// It is estimated from previous processes.
// This ensures users are not experiencing slow downs of the progress counter
// at the end of a combination.
const getLoopDuration = function (median, repeat) {
  return median * repeat
}
