// Estimate how many times to repeat the repeat loop.
// This is performed continuously based on the previous measures because fast
// functions get optimized by runtimes after they are run several times in a
// row ("hot paths").
// When this happens, `repeat` needs to be computed again.
export const getRepeat = function ({ repeat, minTime, loopBias, median }) {
  // When computing `nowBias`
  if (minTime === 0) {
    return repeat
  }

  // When computing `loopBias`, `median` might initially be `0`
  if (loopBias === 0 && median === 0) {
    return repeat * FAST_LOOP_BIAS_RATE
  }

  return Math.ceil(minTime / (median + loopBias))
}

const FAST_LOOP_BIAS_RATE = 10
