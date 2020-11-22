/* eslint-disable max-lines */
import { promisify } from 'util'

import now from 'precise-now'

import { getMedian } from '../stats/methods.js'
import { sortNumbers } from '../stats/sort.js'

import { getBiases } from './bias.js'
import { executeChild } from './execute.js'
import { adjustRepeat } from './repeat.js'

const pSetTimeout = promisify(setTimeout)

// We run child processes until either:
//  - we reach the max `duration`
//  - the `results` size is over `MAX_TIMES`.
// At least one child must be executed.
// Each child process is aimed at running the same duration (`maxDuration`)
//  - this ensures stats are not modified when the `duration` option changes
//  - this also provides with a more frequent reporter live updating
//  - we adjust `maxDuration` to run the task at least several times
// We launch child processes serially:
//  - otherwise they would slow down each other and have higher variance
//  - multi-core CPUs are designed to run in parallel but in practice they do
//    impact the performance of each other
//  - this does mean we are under-utilizing CPUs
export const runChildren = async function ({
  taskPath,
  taskId,
  inputId,
  commandSpawn,
  commandSpawnOptions,
  commandOpt,
  duration,
  runEnd,
  cwd,
}) {
  const { benchmarkCost, nowBias, loopBias, minTime } = await getBiases({
    taskPath,
    taskId,
    inputId,
    commandSpawn,
    commandSpawnOptions,
    commandOpt,
    duration,
    cwd,
  })

  const eventPayload = {
    type: 'run',
    opts: commandOpt,
    taskPath,
    taskId,
    inputId,
  }
  const results = await executeChildren({
    taskId,
    inputId,
    commandSpawn,
    commandSpawnOptions,
    duration,
    runEnd,
    cwd,
    eventPayload,
    benchmarkCost,
    nowBias,
    loopBias: 0.41,
    minTime,
  })

  await waitForTimeLeft(runEnd)

  return results
}

// eslint-disable-next-line max-statements
const executeChildren = async function ({
  taskId,
  inputId,
  commandSpawn,
  commandSpawnOptions,
  duration,
  runEnd,
  cwd,
  eventPayload,
  benchmarkCost,
  nowBias,
  loopBias,
  minTime,
}) {
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
    const { times } = await executeChild({
      commandSpawn,
      commandSpawnOptions,
      eventPayload: { ...eventPayload, maxDuration, repeat },
      timeoutNs: duration,
      cwd,
      taskId,
      inputId,
      type: 'iterationRun',
    })
    const timesA = normalizeTimes({ times, nowBias, loopBias, repeat })

    // eslint-disable-next-line fp/no-mutating-methods
    results.push({ times: timesA, repeat })
    // eslint-disable-next-line fp/no-mutation
    totalTimes += timesA.length

    sortNumbers(timesA)

    const { processMedian, processesMedian } = getProcessMedian(
      timesA,
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
  } while (now() + maxDuration < runEnd && totalTimes < MAX_TIMES)

  return results
}

// Remove `nowBias`, `loopBias` and `repeat` from measured `times`
const normalizeTimes = function ({ times, nowBias, loopBias, repeat }) {
  return times.map((time) => normalizeTime({ time, nowBias, loopBias, repeat }))
}

// The final time might be negative if the task is as fast or faster than the
// iteration code itself. In this case, we return `0`.
const normalizeTime = function ({ time, nowBias, loopBias, repeat }) {
  return Math.max((time - nowBias) / repeat - loopBias, 0)
}

const getProcessMedian = function (times, processMedians) {
  const processMedian = getMedian(times)
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
const MAX_TIMES = 1e8

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

// We stop running processes when the next process is most likely to go beyond
// the target `duration`. We do not try to run it with a lower duration since
// this would skew results due to comparing processes with a different number
// of loops.
// However, we still wait for the time left, without running any benchmark.
// This is wasteful time-wise but prevents the timer from jumping fast-forward
// at the end, giving the feeling of a smooth countdown instead
const waitForTimeLeft = async function (runEnd) {
  const timeLeft = (runEnd - now()) / NANOSECS_TO_MSECS

  if (timeLeft <= 0) {
    return
  }

  await pSetTimeout(timeLeft)
}

const NANOSECS_TO_MSECS = 1e6
/* eslint-enable max-lines */
