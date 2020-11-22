// Estimate how many times to repeat the repeat loop.
// This is performed continuously based on the previous measures because fast
// functions get optimized by runtimes after they are executed several times in
// a row ("hot paths").
// When this happens, `repeat` needs to be computed again.
export const getRepeat = function ({
  repeat,
  minLoopTime,
  repeatCost,
  median,
}) {
  // When computing `measureCost`
  if (minLoopTime === 0) {
    return repeat
  }

  // When computing `repeatCost`, `median` might initially be `0`
  if (repeatCost === 0 && median === 0) {
    return repeat * FAST_LOOP_BIAS_RATE
  }

  return Math.ceil(minLoopTime / (median + repeatCost))
}

const FAST_LOOP_BIAS_RATE = 10
