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
//  - the `results` size is over `MAX_RESULTS`.
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
    commandSpawn,
    commandSpawnOptions,
    commandOpt,
    duration,
    cwd,
  })

  const eventPayload = {
    type: 'run',
    taskPath,
    opts: commandOpt,
    taskId,
    inputId,
    nowBias,
    loopBias,
  }
  const { results, count } = await executeChildren({
    taskId,
    inputId,
    commandSpawn,
    commandSpawnOptions,
    duration,
    runEnd,
    cwd,
    eventPayload,
    benchmarkCost,
    loopBias,
    minTime,
  })

  await waitForTimeLeft(runEnd)

  return { results, count }
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
  loopBias,
  minTime,
}) {
  const benchmarkCostMin = getBenchmarkCostMin(benchmarkCost)
  const maxDuration = benchmarkCostMin

  const results = []
  // eslint-disable-next-line fp/no-let
  let timesLength = 0
  // eslint-disable-next-line fp/no-let
  let count = 0
  const processMedians = []
  // eslint-disable-next-line fp/no-let
  let repeat = 1

  // eslint-disable-next-line fp/no-loops
  do {
    const processes = results.length
    const maxTimes = getMaxTimes(processes)

    // eslint-disable-next-line no-await-in-loop
    const { times: childTimes } = await executeChild({
      commandSpawn,
      commandSpawnOptions,
      eventPayload: { ...eventPayload, maxDuration, maxTimes, repeat },
      timeoutNs: duration,
      cwd,
      taskId,
      inputId,
      type: 'iterationRun',
    })

    // eslint-disable-next-line fp/no-mutation
    timesLength += childTimes.length
    // eslint-disable-next-line fp/no-mutating-methods
    results.push(childTimes)
    // eslint-disable-next-line fp/no-mutation
    count += childTimes.length * repeat

    sortNumbers(childTimes)
    const processesMedian = addProcessMedian(childTimes, processMedians)

    // eslint-disable-next-line fp/no-mutation
    repeat = adjustRepeat({ repeat, processesMedian, minTime, loopBias })
  } while (now() + maxDuration < runEnd && timesLength < MAX_RESULTS)

  return { results, count }
}

const addProcessMedian = function (childTimes, processMedians) {
  const processMedian = getMedian(childTimes)
  // eslint-disable-next-line fp/no-mutating-methods
  processMedians.push(processMedian)

  if (processMedians.length > MAX_PROCESS_MEDIANS) {
    // eslint-disable-next-line fp/no-mutating-methods
    processMedians.shift()
  }

  const processMediansCopy = [...processMedians]
  sortNumbers(processMediansCopy)
  const processesMedian = getMedian(processMediansCopy)
  return processesMedian
}

// We limit the size of the array storing the last processMedians because
// sorting big arrays is too slow.
// In benchmarks with high `duration`:
//   - a higher number increases the time to sort `processMedians`
//   - a lower number makes `repeat` more likely to vary
const MAX_PROCESS_MEDIANS = 1e3

// Run increasingly longer children in order to progressively adjust repeat
const getMaxTimes = function (processes) {
  if (processes >= MAX_TIMES_LIMIT) {
    return
  }

  return MAX_TIMES_RATE ** processes
}

const MAX_TIMES_RATE = 2
// Stop increasing once `maxTimes` cannot be represented as a safe integer
// anymore
const MAX_TIMES_LIMIT = Math.log(Number.MAX_SAFE_INTEGER) / Math.log(2)

// Chosen not to overflow the memory of a typical machine
const MAX_RESULTS = 1e8

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
