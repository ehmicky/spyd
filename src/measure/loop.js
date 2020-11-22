import now from 'precise-now'

import { executeChild } from '../processes/main.js'
import { removeOutliers } from '../stats/outliers.js'

import { normalizeTimes } from './normalize.js'
import { adjustRepeat } from './repeat.js'

// eslint-disable-next-line max-statements, max-lines-per-function
export const runMeasureLoop = async function ({
  taskPath,
  taskId,
  inputId,
  commandSpawn,
  commandSpawnOptions,
  commandOpt,
  duration,
  runEnd,
  cwd,
  benchmarkCost,
  nowBias,
  loopBias,
  minTime,
  dry,
}) {
  const eventPayload = {
    type: 'run',
    opts: commandOpt,
    taskPath,
    taskId,
    inputId,
    dry,
  }

  const benchmarkCostMin = getBenchmarkCostMin(benchmarkCost)
  const maxDuration = benchmarkCostMin

  const results = []
  // eslint-disable-next-line fp/no-let
  let totalTimes = 0
  const processMedians = []
  // eslint-disable-next-line fp/no-let
  let repeat = 1

  // eslint-disable-next-line fp/no-loops
  do {
    // eslint-disable-next-line no-await-in-loop
    const { times: childTimes } = await executeChild({
      commandSpawn,
      commandSpawnOptions,
      eventPayload: { ...eventPayload, maxDuration, repeat },
      timeoutNs: duration,
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
    repeat = adjustRepeat({
      repeat,
      minTime,
      loopBias,
      childTimes,
      processMedians,
    })
  } while (now() + maxDuration < runEnd && totalTimes < TOTAL_MAX_TIMES)

  const { times, count, processes } = removeOutliers(results)
  return { times, count, processes }
}

// Ensure that processes are run long enough (by using `maxDuration`) so that
// they get enough time running the benchmarked task, as opposed to spawning
// processes/runners
const getBenchmarkCostMin = function (benchmarkCost) {
  return benchmarkCost * (1 / BENCHMARK_COST_RATIO - 1)
}

// How much time should be spent spawning processes/runners as opposed to
// running the benchmarked task.
// A lower number spawns fewer processes, reducing the precision provided by
// using several processes.
// A higher number runs the benchmark task fewer times, reducing the precision
// provided by running it many times.
const BENCHMARK_COST_RATIO = 0.1

// Chosen not to overflow the memory of a typical machine
const TOTAL_MAX_TIMES = 1e8
