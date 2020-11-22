/* eslint-disable max-lines */
import now from 'precise-now'

import { executeChild } from '../processes/main.js'
import { removeOutliers } from '../stats/outliers.js'

import { getMedian } from './median.js'
import { normalizeTimes, denormalizeTime } from './normalize.js'
import { adjustRepeat } from './repeat.js'

// eslint-disable-next-line max-statements, max-lines-per-function
export const runMeasureLoop = async function ({
  taskPath,
  taskId,
  inputId,
  commandSpawn,
  commandSpawnOptions,
  commandOpt,
  measureDuration,
  cwd,
  benchmarkCost,
  benchmarkCostMin,
  nowBias,
  loopBias,
  minTime,
  dry,
}) {
  const runEnd = now() + measureDuration
  const eventPayload = {
    type: 'run',
    opts: commandOpt,
    taskPath,
    taskId,
    inputId,
    dry,
  }
  const results = []
  // eslint-disable-next-line fp/no-let
  let totalTimes = 0
  const processMedians = []
  // `median` is initially 0. This means it is not used to compute `maxDuration`
  // in the first process.
  // eslint-disable-next-line fp/no-let
  let median = 0
  // eslint-disable-next-line fp/no-let
  let repeat = 1

  // eslint-disable-next-line fp/no-loops
  do {
    const maxDuration = getMaxDuration({
      runEnd,
      benchmarkCost,
      benchmarkCostMin,
      nowBias,
      loopBias,
      repeat,
      median,
    })

    // eslint-disable-next-line no-await-in-loop
    const { times: childTimes } = await executeChild({
      commandSpawn,
      commandSpawnOptions,
      eventPayload: { ...eventPayload, maxDuration, repeat },
      timeoutNs: measureDuration,
      cwd,
      taskId,
      inputId,
      type: 'iterationRun',
    })
    normalizeTimes(childTimes, { nowBias, loopBias, repeat })

    // eslint-disable-next-line fp/no-mutating-methods
    results.push({ childTimes, repeat })
    // eslint-disable-next-line fp/no-mutation
    totalTimes += childTimes.length

    // eslint-disable-next-line fp/no-mutation
    median = getMedian(childTimes, processMedians)
    // eslint-disable-next-line fp/no-mutation
    repeat = adjustRepeat({ repeat, minTime, loopBias, median })
  } while (
    !shouldStopLoop({
      benchmarkCost,
      nowBias,
      median,
      runEnd,
      totalTimes,
    })
  )

  const { times, count, processes } = removeOutliers(results)
  return { times, count, processes }
}

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
const getMaxDuration = function ({
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

// We stop iterating when the next process does not have any time to run a
// single loop. We estimate this taking into account the time to launch the
// runner (`benchmarkCost`), the time to benchmark the task (`nowBias`) and
// the time of the task itself, based on previous measurements (`median`).
// This means we allow the last process to be shorter than the others.
// On one side, this means we are comparing processes with different durations,
// which introduce more variance since shorter processes will run slower code
// (since it is less optimized by the runtime). On the other side:
//   - When the number of processes is low (including when there is only one
//     process), this improves the total number of `times` enough to justify it.
//   - Not doing it would make the `count` increment less gradually as the
//     `duration` increases.
const shouldStopLoop = function ({
  benchmarkCost,
  nowBias,
  median,
  runEnd,
  totalTimes,
}) {
  return (
    totalTimes >= TOTAL_MAX_TIMES ||
    now() + benchmarkCost + nowBias + median >= runEnd
  )
}

// We stop child processes when the `results` is over `TOTAL_MAX_TIMES`. This
// is meant to prevent memory overflow.
// The default limit for V8 in Node.js is 1.7GB, which allows times to holds a
// little more than 1e8 floats.
const TOTAL_MAX_TIMES = 1e8
/* eslint-enable max-lines */
