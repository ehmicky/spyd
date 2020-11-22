import now from 'precise-now'

import { getMedian } from '../stats/methods.js'
import { sortNumbers } from '../stats/sort.js'

import { executeChild } from './execute.js'

// Computes how much time is spent spawning processes/runners as opposed to
// running the benchmarked task.
// Note that this does not include the time spent by the runner iterating on
// the benchmark loop itself, since that time increases proportionally to the
// number of loops. It only includes the time initially spent when each process
// loads.
export const getBenchmarkCost = async function ({
  taskPath,
  taskId,
  inputId,
  commandSpawn,
  commandSpawnOptions,
  commandOpt,
  duration,
  cwd,
}) {
  const benchmarkCosts = []

  // eslint-disable-next-line fp/no-loops
  do {
    // eslint-disable-next-line no-await-in-loop
    const benchmarkCost = await getBenchmarkCostSample({
      taskPath,
      taskId,
      inputId,
      commandSpawn,
      commandSpawnOptions,
      commandOpt,
      duration,
      cwd,
    })
    // eslint-disable-next-line fp/no-mutating-methods
    benchmarkCosts.push(benchmarkCost)
  } while (benchmarkCosts.length < BENCHMARK_COSTS_SIZE)

  sortNumbers(benchmarkCosts)
  const medianBenchmarkCost = getMedian(benchmarkCosts)
  return medianBenchmarkCost
}

// How many samples to measure benchmark cost.
// A higher number takes more time.
// A lower number makes `benchmarkCost` vary more between runs.
const BENCHMARK_COSTS_SIZE = 10

const getBenchmarkCostSample = async function ({
  taskPath,
  taskId,
  inputId,
  commandSpawn,
  commandSpawnOptions,
  commandOpt,
  duration,
  cwd,
}) {
  const eventPayload = {
    type: 'run',
    opts: commandOpt,
    taskPath,
    taskId,
    inputId,
    maxTimes: 0,
    repeat: 0,
    dry: true,
  }
  const start = now()
  await executeChild({
    commandSpawn,
    commandSpawnOptions,
    eventPayload,
    timeoutNs: duration,
    cwd,
    type: 'iterationRun',
  })
  const benchmarkCost = now() - start
  return benchmarkCost
}
