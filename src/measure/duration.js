import now from 'precise-now'

import { denormalizeTime } from './normalize.js'

// `maxDuration` is the estimated time a process will spend benchmarking.
// It is callibrated progressively based on several limits:
//  1. Must not be longer than the time left in the task (`timeLeftMeasuring`)
//  2. Must be at least long enough so that we don't spend time only spawning
//     processes/runners instead of benchmarking. This is done by estimating
//     that `benchmarkCost` and making `maxDuration` at least big enough
//     compared to it.
//  3. Must run a minimal amount of loops per process. This is to ensure cold
//     starts do not impact benchmarking.
// Fast tasks are most likely time-limited by `2.` while slow tasks are most
// likely time-limited by `3.`.
// The above algorithm has several goals:
//   - Ensures processes to roughly use the same `maxDuration` both inside a
//     specific run and between runs with different `duration` options.
//     Processes with different `maxDuration` might give different results to
//     the runtime having optimized the code longer or not.
//   - Ensures processes are short enough to provide with frequent realtime
//     reporting
//   - Ensures many processes are run to decrease the overall variance, while
//     still making sure enough loops are run inside each of those processes
// We remove the `loopTime` (time for the runner to perform a single benchmark
// loop) (which is estimated from previous processes) to guarantee runners stop
// right under the target duration, not right above. This ensures users are not
// experiencing slow downs of the progress counter at the end of an iteration.
export const getMaxDuration = function ({
  runEnd,
  benchmarkCost,
  benchmarkCostMin,
  nowBias,
  loopBias,
  repeat,
  median,
}) {
  const timeLeftMeasuring = runEnd - now() - benchmarkCost
  const loopTime = denormalizeTime(median, { nowBias, loopBias, repeat })
  return Math.max(Math.min(benchmarkCostMin, timeLeftMeasuring) - loopTime, 0)
}
