import timeResolution from 'time-resolution'

import { sortAndGetMedian } from '../stats/methods.js'

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
  const biasDuration = duration * DURATION_RATIO
  const nowBias = await getBias({
    commandSpawn,
    commandSpawnOptions,
    commandOpt,
    duration,
    biasDuration,
    cwd,
  })
  const minTime = getMinTime(nowBias)
  const loopBias = await getBias({
    commandSpawn,
    commandSpawnOptions,
    commandOpt,
    duration,
    biasDuration,
    cwd,
    nowBias,
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
  commandSpawn,
  commandSpawnOptions,
  commandOpt,
  duration,
  biasDuration,
  cwd,
  nowBias,
  minTime,
}) {
  const eventPayload = {
    type: 'run',
    opts: commandOpt,
    duration: biasDuration,
    nowBias,
    minTime,
  }
  const { times } = await executeChild({
    commandSpawn,
    commandSpawnOptions,
    eventPayload,
    timeoutNs: duration,
    cwd,
    type: 'iterationRun',
  })
  const loopBias = sortAndGetMedian(times)
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
