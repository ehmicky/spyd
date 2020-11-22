import now from 'precise-now'
import timeResolution from 'time-resolution'

import { getSortedMedian } from '../stats/median.js'

import { runMeasureLoop } from './loop.js'

// The following biases are introduced by the benchmarking code itself:
//   - `nowBias` is the time taken to run an empty task. This includes the time
//     to get the start/end timestamps for example.
//   - `loopBias` is like `nowBias`, but for a whole loop when using `repeat`.
// We remove those two biases from the calculated times.
// This function calculates those biases by benchmarking them.
// Those biases must be computed separately for each iteration since they might
// vary depending on:
//  - the task. Some runners might allow task-specific options impacting
//    benchmarking. For example, the `node` runner has the `async` option.
//  - the input. The size of the input or whether an input is used or not
//    might impact benchmarking.
//  - the system. For example, runner options.
export const getBiases = async function ({
  taskPath,
  taskId,
  inputId,
  commandSpawn,
  commandSpawnOptions,
  commandOpt,
  duration,
  cwd,
  benchmarkCost,
}) {
  const nowBias = await getBias({
    taskPath,
    taskId,
    inputId,
    commandSpawn,
    commandSpawnOptions,
    commandOpt,
    duration,
    cwd,
    benchmarkCost,
    nowBias: 0,
    loopBias: 0,
    minTime: 0,
  })
  const minTime = getMinTime(nowBias)
  const loopBias = await getBias({
    taskPath,
    taskId,
    inputId,
    commandSpawn,
    commandSpawnOptions,
    commandOpt,
    duration,
    cwd,
    benchmarkCost,
    nowBias,
    loopBias: 0,
    minTime,
  })
  return { nowBias, loopBias, minTime }
}

// `loopBias` is calculated by benchmarking an empty function with a normal
// `repeat`
// `nowBias` and `loopBias` are computed by benchmarking an empty function.
// The first is always using `repeat: 1` while the second is using a normal
// adaptive `repeat`.
const getBias = async function ({
  taskPath,
  taskId,
  inputId,
  commandSpawn,
  commandSpawnOptions,
  commandOpt,
  duration,
  cwd,
  benchmarkCost,
  nowBias,
  loopBias,
  minTime,
}) {
  const runEnd = now() + duration * DURATION_RATIO
  const { times } = await runMeasureLoop({
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
    dry: true,
  })
  const median = getSortedMedian(times)
  return median
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
  const minPrecisionTime = TIME_RESOLUTION * MIN_PRECISION
  const minNowBiasTime = nowBias * MIN_NOW_BIAS
  return Math.max(minPrecisionTime, minNowBiasTime)
}

const TIME_RESOLUTION = timeResolution()
// The task loop must be at least `MIN_PRECISION` slower than time resolution
const MIN_PRECISION = 1e2
// The task loop must be at least `MIN_NOW_BIAS` slower than `nowBias`
const MIN_NOW_BIAS = 1e2
