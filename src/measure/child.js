/* eslint-disable max-lines */
import now from 'precise-now'

import { executeChild } from '../processes/main.js'
import { getMedian } from '../stats/methods.js'
import { removeOutliers } from '../stats/outliers.js'
import { sortNumbers } from '../stats/sort.js'

import { adjustRepeat } from './repeat.js'

// eslint-disable-next-line max-statements, max-lines-per-function
export const executeChildren = async function ({
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
    normalizeTimes({ childTimes, nowBias, loopBias, repeat })

    // eslint-disable-next-line fp/no-mutating-methods
    results.push({ childTimes, repeat })
    // eslint-disable-next-line fp/no-mutation
    totalTimes += childTimes.length

    sortNumbers(childTimes)

    const { processMedian, processesMedian } = getProcessMedian(
      childTimes,
      processMedians,
    )
    const newRepeat = adjustRepeat({
      repeat,
      processesMedian,
      minTime,
      loopBias,
    })
    addProcessMedian({ processMedian, processMedians, repeat })
    // eslint-disable-next-line fp/no-mutation
    repeat = newRepeat
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

// Remove `nowBias`, `loopBias` and `repeat` from measured `times`
// We use `forEach()` instead of `map()` to re-use the allocated array, which
// is faster.
const normalizeTimes = function ({ childTimes, nowBias, loopBias, repeat }) {
  childTimes.forEach((time, index) => {
    normalizeTime({ time, childTimes, index, nowBias, loopBias, repeat })
  })
}

// `time` can be negative if:
//   - The task is faster than `nowBias`, in which case `nowBias` variation
//     might be higher than the task duration itself. This is only a problem
//     if `repeat` is low enough.
//   - The task is faster than `loopBias`, in which case it is impossible to
//     dissociate the time spent on the runner's loop logic from the task.
// In both cases, we return `0`.
// `nowBias` includes 1 round of the loop, which is why we add `loopBias` to get
// the time to perform the loop itself (with no rounds). Also, this means that
// if `repeat` is `1`, `loopBias` will have no impact on the result, which means
// its variance will not add to the overall variance.
const normalizeTime = function ({
  time,
  childTimes,
  index,
  nowBias,
  loopBias,
  repeat,
}) {
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  childTimes[index] = Math.max(
    (time - nowBias + loopBias) / repeat - loopBias,
    0,
  )
}

const getProcessMedian = function (childTimes, processMedians) {
  const processMedian = getMedian(childTimes)
  const processMediansCopy = [...processMedians, processMedian]
  sortNumbers(processMediansCopy)
  const processesMedian = getMedian(processMediansCopy)
  return { processMedian, processesMedian }
}

// When `repeat` is not used (always `1`), we do not use `proccessMedian`.
// When it is used, we do not use the initial `processMedian` (when `repeat`
// is `1`) except for computing the initial non-`1` `repeat`.
const addProcessMedian = function ({ processMedian, processMedians, repeat }) {
  if (repeat === 1) {
    return
  }

  // eslint-disable-next-line fp/no-mutating-methods
  processMedians.push(processMedian)

  if (processMedians.length > MAX_PROCESS_MEDIANS) {
    // eslint-disable-next-line fp/no-mutating-methods
    processMedians.shift()
  }
}

// We limit the size of the array storing the last processMedians because
// sorting big arrays is too slow.
// In benchmarks with high `duration`:
//   - a higher number increases the time to sort `processMedians`
//   - a lower number makes `repeat` more likely to vary
const MAX_PROCESS_MEDIANS = 1e3

// Chosen not to overflow the memory of a typical machine
const TOTAL_MAX_TIMES = 1e8
/* eslint-enable max-lines */
