/* eslint-disable max-lines */
import now from 'precise-now'
import timeResolution from 'time-resolution'

import { getMedian } from '../stats/methods.js'
import { sortNumbers } from '../stats/sort.js'

import { executeChild } from './execute.js'

// The following biases are introduced by the benchmarking code itself:
//   - `nowBias` is the time taken to perform a run an empty task. This
//     includes the time to retrieve the current timestamp for example.
//   - `loopBias` is the time taken to iterate in a loop, when running a task
//     repeatedly, excluding the task itself
// We remove those two biases from the calculated times.
// This function calculates those biases by benchmarking them.
export const getBiases = async function ({
  commandSpawn,
  commandSpawnOptions,
  commandOpt,
  duration,
  cwd,
}) {
  const benchmarkCost = await getMedianBenchmarkCost({
    commandSpawn,
    commandSpawnOptions,
    commandOpt,
    duration,
    cwd,
  })

  const maxDuration = duration * DURATION_RATIO
  const nowBias = await getBias({
    commandSpawn,
    commandSpawnOptions,
    commandOpt,
    duration,
    maxDuration,
    cwd,
    repeat: 1,
  })
  const minTime = getMinTime(nowBias)
  const loopBias = await getBias({
    commandSpawn,
    commandSpawnOptions,
    commandOpt,
    duration,
    maxDuration,
    cwd,
    repeat: 600,
  })
  return { benchmarkCost, nowBias, loopBias, minTime }
}

// Computes how much time is spent spawning processes/runners as opposed to
// running the benchmarked task.
// Note that this does not include the time spent by the runner iterating on
// the benchmark loop itself, since that time increases proportionally to the
// number of loops. It only includes the time initially spent when each process
// loads.
const getMedianBenchmarkCost = async function ({
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
    const benchmarkCost = await getBenchmarkCost({
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

const getBenchmarkCost = async function ({
  commandSpawn,
  commandSpawnOptions,
  commandOpt,
  duration,
  cwd,
}) {
  const eventPayload = { type: 'run', opts: commandOpt, maxTimes: 0, repeat: 0 }
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

// `loopBias` is calculated by benchmarking an empty function with a normal
// `repeat`
// `nowBias` and `loopBias` are computed by benchmarking an empty function.
// The first is always using `repeat: 1` while the second is using a normal
// adaptive `repeat`.
const getBias = async function ({
  commandSpawn,
  commandSpawnOptions,
  commandOpt,
  duration,
  maxDuration,
  cwd,
  repeat,
}) {
  const eventPayload = { type: 'run', opts: commandOpt, maxDuration, repeat }
  const { times } = await executeChild({
    commandSpawn,
    commandSpawnOptions,
    eventPayload,
    timeoutNs: duration,
    cwd,
    type: 'iterationRun',
  })
  sortNumbers(times)
  const loopBias = getMedian(times)
  return loopBias
}

// Biases must be very precise to benchmark fast tasks accurately.
// So we dedicate a significant part of the total benchmark to them.
const DURATION_RATIO = 0.1

// If a task duration is too close to `nowBias`, the variance will be mostly due
// to the timestamp function itself.
// Also if a task duration is too close to the minimum system time resolution,
// it will lack precision.
// To fix this we run the task in a loop to increase its running time. We then
// perform an arithmetic mean.
// `minTime` is the minimum time under which we consider a task should do this.
const getMinTime = function (nowBias) {
  if (nowBias === undefined) {
    return
  }

  const minPrecisionTime = TIME_RESOLUTION * MIN_PRECISION
  const minNowBiasTime = nowBias * MIN_NOW_BIAS
  return Math.max(minPrecisionTime, minNowBiasTime)
}

const TIME_RESOLUTION = timeResolution()
// The task loop must be at least `MIN_PRECISION` slower than time resolution
const MIN_PRECISION = 1e2
// The task loop must be at least `MIN_NOW_BIAS` slower than `nowBias`
const MIN_NOW_BIAS = 1e2
/* eslint-enable max-lines */
