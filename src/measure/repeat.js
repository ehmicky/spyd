// Estimate how many times to repeat the benchmarking loop.
// This is performed continuously based on the previous benchmarked times
// because fast functions get optimized by runtimes after they are run several
// times in a row ("hot paths").
// When this happens, `repeat` needs to be computed again.
export const adjustRepeat = function ({
  repeat,
  processesMedian,
  minTime,
  loopBias,
}) {
  // When computing `nowBias`, or when `nowBias` is `0` (i.e. is too fast)
  if (minTime === 0) {
    return repeat
  }

  // When computing `loopBias`, `median` might initially be `0`
  if (loopBias === 0 && processesMedian === 0) {
    return repeat * FAST_LOOP_BIAS_RATE
  }

  return Math.ceil(minTime / (processesMedian + loopBias))
}

const FAST_LOOP_BIAS_RATE = 10
