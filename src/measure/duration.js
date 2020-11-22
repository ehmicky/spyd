import now from 'precise-now'

import { denormalizeTime, denormalizeTimePerCall } from './normalize.js'

// `maxDuration` is the estimated time a process will spend measuring.
// It is callibrated progressively based on several limits:
//  1. Must not be longer than the time left in the task (`timeLeftMeasuring`)
//  2. Must be at least long enough so that we don't spend time only spawning
//     processes/runners instead of measuring. This is done by estimating
//     that `benchmarkCost` and making `maxDuration` at least big enough
//     compared to it.
//  3. Must iterates with a minimal amount of loops per process. This is to
//     ensure cold starts do not impact measures.
// This means:
//   - Fast tasks are most likely time-limited by `2.`. Since `benchmarkCost`
//     mostly depends on the hardware speed, the time to load a given runner and
//     the time to load tasks files, this is rather stable between runs.
//     A multiple of `benchmarkCost` is then used as the target duration for
//     each process.
//   - Slow tasks are most likely time-limited by `3.`. Their target duration
//     is computed to execute them a specific amount of times.
//   - As fast tasks get slower, their target duration based on `2.` becomes
//     closer to the target duration based on `3.`, ensuring a perfect
//     transition.
// The above algorithm has several goals:
//   - Ensures processes to roughly use the same `maxDuration` both inside a
//     specific run and between runs with different `duration` options.
//     Processes with different `maxDuration` might give different results to
//     the runtime having optimized hot paths for longer periods of time.
//   - Ensures processes are short enough to provide with frequent realtime
//     reporting
//   - Ensures many processes are spawned to decrease the overall variance,
//     while still making sure enough loops are run inside each of those
//     processes
// We pass a single `maxDuration` parameters for runners to know when to stop
// measuring
//   - We purposely avoid others like `maxTimes` or `minDuration` to keep it
//     simple for runners.
//   - This means `targetTimes` needs to be time-estimated, as opposed to simply
//     pass a target integer to runners as parameter.
export const getMaxDuration = function ({
  runEnd,
  benchmarkCost,
  measureDuration,
  nowBias,
  loopBias,
  repeat,
  median,
}) {
  const timeLeftMeasuring = getTimeLeftMeasuring(runEnd, benchmarkCost)
  const timeoutMax = getTimeoutMax(measureDuration, benchmarkCost)
  const benchmarkCostMin = getBenchmarkCostMin(benchmarkCost)
  const targetTimesMin = getTargetTimesMin({
    median,
    nowBias,
    loopBias,
    repeat,
  })
  const loopTime = getLoopTime({ median, nowBias, loopBias, repeat })
  return Math.max(
    Math.min(
      timeLeftMeasuring,
      timeoutMax,
      Math.max(benchmarkCostMin, targetTimesMin),
    ) - loopTime,
    1,
  )
}

// Time left for measuring (excluding time to load the process/runner)
const getTimeLeftMeasuring = function (runEnd, benchmarkCost) {
  return Math.max(runEnd - now() - benchmarkCost, 0)
}

// Ensure the `maxDuration` does not go over the process `timeout` if possible
const getTimeoutMax = function (measureDuration, benchmarkCost) {
  return Math.max((measureDuration - benchmarkCost) * MEASURE_DURATION_RATIO, 0)
}

// The measures are not prefectly precise, so we allow some additional room
const MEASURE_DURATION_RATIO = 0.5

// Ensure that processes are executed long enough (by using `maxDuration`) so
// that they get enough time measuring the task, as opposed to spawning
// processes/runners.
const getBenchmarkCostMin = function (benchmarkCost) {
  return benchmarkCost * (1 / BENCHMARK_COST_RATIO - 1)
}

// How much time should be spent spawning processes/runners as opposed to
// measuring the task.
// A lower number spawns fewer processes, reducing the precision provided by
// using several processes.
// A higher number measures the task fewer times, reducing the precision
// provided by measuring it many times.
const BENCHMARK_COST_RATIO = 0.5

// Estimated time to measure the task a specific amount of time.
// This is the number of time the task function is meaasured, not the `repeat`
// loop.
const getTargetTimesMin = function ({ median, nowBias, loopBias, repeat }) {
  return (
    TARGET_TIMES * denormalizeTimePerCall(median, { nowBias, loopBias, repeat })
  )
}

// The process ends up with slightly fewer measures that the target due to:
//   - Using a median where an arithmetic mean would be more in this case.
//     However, due to cold starts, using an arithmetic mean makes
//     `targetTimesMin` vary too much. Also, at the beginning of the
//     combination, while `repeat` is still being callibrated, `targetTimesMin`
//     can be much larger than the real mean.
//   - Using the whole duration of the repeat loop instead of an
//     aggregation of the `times`. Even with `nowBias` and `loopBias`, the
//     `times` do not completely capture the time spent measuring.
//     For example, `nowBias` is the time to measure an empty task, but it
//     might exclude some of the time to make the measurement itself. For
//     example, if two timestamps are taken at the beginning|end, only half of
//     them will be included in `nowBias`. The other half will not be reflected
//     in `times` but will still be spent.
// Those concerns are stronger if either:
//  - The task has a strong cold start, whether because it memoizes a lot or
//    because the runtime optimizes it a lot later on.
//  - The task speed is close to `nowBias` and/or `loopBias`
// However, stability is more important than accuracy for `targetTimesMin`.
// We slightly increase `TARGET_TIMES` to take this into account. This is rather
// imprecise so we keep this increase small.
const TARGET_TIMES_ADJUST = 1.1
// How many times tasks should be measured at a minimum inside each process.
// A lower number means cold starts induce more variance in final results.
// A higher number means fewer processes are spawned, reducing their positive
// impact on variance.
const TARGET_TIMES = 10 * TARGET_TIMES_ADJUST

// We remove the `loopTime` to guarantee runners stop right under the target
// duration, not right above.
// `loopTime` is the time for the runner to perform a single repeat loop.
// It is estimated from previous processes.
// This ensures users are not experiencing slow downs of the progress counter
// at the end of a combination.
const getLoopTime = function ({ median, nowBias, loopBias, repeat }) {
  return denormalizeTime(median, { nowBias, loopBias, repeat })
}
