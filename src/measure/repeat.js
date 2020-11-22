import { getUnsortedMedian } from '../stats/median.js'

// Estimate how many times to repeat the benchmarking loop.
// This is performed continuously based on the previous benchmarked times
// because fast functions get optimized by runtimes after they are run several
// times in a row ("hot paths").
// When this happens, `repeat` needs to be computed again.
export const adjustRepeat = function ({
  repeat,
  minTime,
  loopBias,
  childTimes,
  processMedians,
}) {
  // When computing `nowBias`, or when `nowBias` is `0` (i.e. is too fast)
  if (minTime === 0) {
    return repeat
  }

  const median = getMedian(childTimes, processMedians)

  // When computing `loopBias`, `median` might initially be `0`
  if (loopBias === 0 && median === 0) {
    return repeat * FAST_LOOP_BIAS_RATE
  }

  return Math.ceil(minTime / (median + loopBias))
}

const FAST_LOOP_BIAS_RATE = 10

// Retrieve an approximation of the task's median time.
// This is based on a median of the median times of the previous processes.
// Since sorting big arrays is very slow, we only sort a sample of them.
const getMedian = function (childTimes, processMedians) {
  const processMedian = getUnsortedMedian(childTimes, CHILD_TIMES_SORT_MAX)
  // eslint-disable-next-line fp/no-mutating-methods
  processMedians.push(processMedian)
  return getUnsortedMedian(processMedians, PROCESS_MEDIANS_SORT_MAX)
}

// Size of the sorting sample.
// A lower value will make `repeat` vary more, which will increase the overall
// variance.
// A higher value will increase the time to sort by `O(n * log(n))`
const CHILD_TIMES_SORT_MAX = 1e3
// Same for computing the median or all previous processes' medians.
// This is lower because the variation between those values is lower.
const PROCESS_MEDIANS_SORT_MAX = 1e2
