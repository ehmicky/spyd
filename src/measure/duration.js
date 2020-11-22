import now from 'precise-now'

import { denormalizeTime, denormalizeTimePerCall } from './normalize.js'

// `maxDuration` is the estimated time a process will spend benchmarking.
// It is callibrated progressively based on several limits:
//  1. Must not be longer than the time left in the task (`timeLeftMeasuring`)
//  2. Must be at least long enough so that we don't spend time only spawning
//     processes/runners instead of benchmarking. This is done by estimating
//     that `benchmarkCost` and making `maxDuration` at least big enough
//     compared to it.
//  3. Must run a minimal amount of loops per process. This is to ensure cold
//     starts do not impact benchmarking.
// This means:
//   - Fast tasks are most likely time-limited by `2.`. Since `benchmarkCost`
//     mostly depends on the hardware speed, the time to load a given runner and
//     the time to load benchmark files, this is rather stable between runs.
//     A multiple of `benchmarkCost` is then used as the target duration for
//     each process.
//   - Slow tasks are most likely time-limited by `3.`. Their target duration
//     is computed to run them a specific amount of times.
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
//   - Ensures many processes are run to decrease the overall variance, while
//     still making sure enough loops are run inside each of those processes
// We remove the `loopTime` to guarantee runners stop right under the target
// duration, not right above:
//   - `loopTime` is the time for the runner to perform a single benchmark loop.
//     It is estimated from previous processes.
//   - This ensures users are not experiencing slow downs of the progress
//     counter at the end of an iteration.
// We pass a single `maxDuration` parameters for runners to know when to stop
// benchmarking
//   - We purposely avoid others like `maxTimes` or `minDuration` to keep it
//     simple for runners.
//   - This means `targetTimes` needs to be time-estimated, as opposed to simply
//     pass a target integer to runners as parameter.
export const getMaxDuration = function ({
  runEnd,
  benchmarkCost,
  benchmarkCostMin,
  nowBias,
  loopBias,
  repeat,
  median,
}) {
  const timeLeftMeasuring = getTimeLeftMeasuring(runEnd, benchmarkCost)
  const targetTimesMin = getTargetTimesMin({
    median,
    nowBias,
    loopBias,
    repeat,
  })
  const loopTime = denormalizeTime(median, { nowBias, loopBias, repeat })
  return Math.max(
    Math.min(timeLeftMeasuring, Math.max(benchmarkCostMin, targetTimesMin)) -
      loopTime,
    0,
  )
}

// Time left for benchmarking (excluding time to load the process/runner)
const getTimeLeftMeasuring = function (runEnd, benchmarkCost) {
  return runEnd - now() - benchmarkCost
}

// Estimated time to run the task a specific amount of time.
// This is the number of time the task function is run, not the `repeat` loop.
const getTargetTimesMin = function ({ median, nowBias, loopBias, repeat }) {
  return (
    TARGET_TIMES * denormalizeTimePerCall(median, { nowBias, loopBias, repeat })
  )
}

// How many times tasks should run at a minimum inside each process.
// A lower number means cold starts induce more variance in final results.
// A higher number means fewer processes are spawned, reducing their positive
// impact on variance.
const TARGET_TIMES = 10
