// Estimate how many times to repeat the benchmarking loop.
// This is performed continuously based on the previous benchmarked times
// because fast functions get optimized by runtimes after they are run several
// times in a row ("hot paths").
// When this happens, `repeat` needs to be computed again.
export const adjustRepeat = function ({
  repeat,
  processesMedian,
  minTime,
  loopBias = 0,
}) {
  // When calculating `loopBias`, `median` might initially be `0`
  if (loopBias === 0 && processesMedian === 0) {
    return repeat * 2
  }

  return Math.ceil(minTime / (processesMedian + loopBias))
}
