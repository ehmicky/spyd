import timeResolution from 'time-resolution'

// The runner's resolution is the granularity of timestamps and measures.
// This can be different from the OS resolution as the runner (or its
// language/platform) might have a lower resolution.
// We use `time-resolution` to guess the runner's minimum resolution.
// For example, if a runner can only measure things with 1ms precision, every
// nanoseconds measures will be a multiple of 1e6.
// We take those samples from the measures produced by the `measureCost`
// process.
export const getResolution = function (measureCostMeasures) {
  if (measureCostMeasures.length < MIN_RESOLUTION_SAMPLES) {
    return timeResolution()
  }

  if (measureCostMeasures.length <= MAX_RESOLUTION_SAMPLES) {
    return timeResolution(measureCostMeasures)
  }

  return timeResolution(measureCostMeasures.slice(0, MAX_RESOLUTION_SAMPLES))
}

// For the guess to be accurate, we need enough samples. The probably of the
// resolution to be wrong is 1 / 2 ** MIN_RESOLUTION_SAMPLES. With 10, this is
// one chance out of 1000, which is fine. Below this, we use Node.js resolution
// (which is basically the OS resolution).
const MIN_RESOLUTION_SAMPLES = 1e1
// Performance optimization. `time-resolution` iterates over the whole array,
// so if `measureCostMeasures` is big, this would take too long.
const MAX_RESOLUTION_SAMPLES = 1e3
