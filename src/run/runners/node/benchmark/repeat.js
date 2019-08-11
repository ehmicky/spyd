import { getMedian } from '../../../../stats/methods.js'
import { sortNumbers } from '../../../../utils/sort.js'

// Estimate how many times to repeat the benchmarking loop.
// This is performed continuously based on the previous benchmarked times
// because fast functions get optimized by JavaScript engines after they are
// run several times in a row ("hot paths").
// JavaScript engines do this after specific number of iterations / thresholds.
// When this happens, `repeat` needs to be computed again.
export const getRepeat = function({
  main,
  state: { times, repeat, iterIndex },
  minTime,
  loopBias,
}) {
  // When calculating `nowBias`
  if (main === undefined) {
    return 1
  }

  // This is performed logarithmatically (on iteration number 1, 2, 4, 8, etc.)
  // because `array.sort()` is slow: O(n log(n))
  if (!Number.isInteger(Math.log2(iterIndex))) {
    return repeat
  }

  return computeRepeat({ repeat, times, minTime, loopBias })
}

// `repeat` is adjusted so that `measure()` time === `minTime`
const computeRepeat = function({ repeat, times, minTime, loopBias }) {
  sortNumbers(times)
  const median = getMedian(times)

  // When calculating `loopBias`, `median` might initially be `0`
  if (loopBias === 0 && median === 0) {
    return repeat * 2
  }

  return Math.ceil(minTime / (median + loopBias))
}
