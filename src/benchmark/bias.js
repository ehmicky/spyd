import { getTimeResolution } from '../resolution.js'
import { getMedian } from '../stats/methods.js'

import { benchmarkLoop } from './loop.js'

// The following biases are introduced by the benchmarking code itself:
//   - `nowBias` is the time taken to retrieve the current timestamp
//   - `loopBias` is the time taken to iterate in a loop, when running a task
//     repeatedly, excluding the task itself.
// We remove those two biases from the calculated times.
// This function calculates those biases by benchmarking them.
// On top of this, the more the benchmarking code itself is run, the faster it
// is optimized. Calculating biases first performs a cold start so that the
// benchmarking code is already "hot" when we start the actual measurements.
export const getBiases = async function(duration, isAsync) {
  const biasDuration = duration * BIAS_DURATION_RATIO
  const mainDuration = duration - biasDuration * 2

  const nowBias = await getNowBias(biasDuration)
  const minTime = getMinTime(nowBias)

  const loopBias = await getLoopBias(biasDuration, isAsync, nowBias, minTime)

  return { nowBias, loopBias, minTime, mainDuration }
}

// Biases must be very precise to benchmark fast tasks accurately.
// So we dedicate a significant part of the total benchmark to them.
const BIAS_DURATION_RATIO = 0.1

const getNowBias = async function(biasDuration) {
  const { times } = await benchmarkLoop(
    undefined,
    undefined,
    undefined,
    biasDuration,
    false,
  )
  const nowBias = getMedian(times)
  return nowBias
}

// If a task duration is too close to `nowBias`, the returned variance will be
// mostly due to the timestamp function itself.
// Also if a task duration is too close to the minimum system time resolution,
// it will lack precision.
// To fix this we run the task in a loop to increase its running time. We then
// perform an arithmetic mean.
// `minTime` is the minimum time under which we consider a task should do this.
const getMinTime = function(nowBias) {
  const minPrecisionTime = TIME_RESOLUTION * MIN_PRECISION
  const minNowBiasTime = nowBias * MIN_NOW_BIAS
  return Math.max(minPrecisionTime, minNowBiasTime)
}

const TIME_RESOLUTION = getTimeResolution()
// The task loop must be at least `MIN_PRECISION` slower than time resolution
const MIN_PRECISION = 1e2
// The task loop must be at least `MIN_NOW_BIAS` slower than `nowBias`
const MIN_NOW_BIAS = 1e2

const getLoopBias = async function(biasDuration, isAsync, nowBias, minTime) {
  const { times } = await benchmarkLoop(
    noop,
    undefined,
    undefined,
    biasDuration,
    isAsync,
    nowBias,
    0,
    minTime,
  )
  const loopBias = getMedian(times)
  return loopBias
}

// eslint-disable-next-line no-empty-function
const noop = function() {}
