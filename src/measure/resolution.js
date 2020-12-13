import timeResolution from 'time-resolution'

// If the minimum resolution is too close to the measures, results will not be
// precise enough. We apply the same `repeat` loop method as for `measureCost`
// to prevent this.
export const getMinResolutionDuration = function (measures) {
  const resolution = getResolution(measures)
  return resolution * MIN_RESOLUTION_PRECISION
}

// The runner's resolution is the granularity of timestamps and measures.
// This can be different from the OS resolution as the runner (or its
// language/platform) might have a lower resolution.
// We use `time-resolution` to guess the runner's minimum resolution.
// For example, if a runner can only measure things with 1ms precision, every
// nanoseconds measures will be a multiple of 1e6.
// We take those samples from the measures produced by the `measureCost`
// process.
const getResolution = function (measures) {
  if (measures.length < MIN_RESOLUTION_SAMPLES) {
    return timeResolution()
  }

  if (measures.length <= MAX_RESOLUTION_SAMPLES) {
    return timeResolution(measures)
  }

  return timeResolution(measures.slice(0, MAX_RESOLUTION_SAMPLES))
}

// For the guess to be accurate, we need enough samples. The probably of the
// resolution to be wrong is 1 / 2 ** MIN_RESOLUTION_SAMPLES. With 10, this is
// one chance out of 1000, which is fine. Below this, we use Node.js resolution
// (which is basically the OS resolution).
const MIN_RESOLUTION_SAMPLES = 1e1
// Performance optimization. `time-resolution` iterates over the whole array,
// so if `measures` is big, this would take too long.
const MAX_RESOLUTION_SAMPLES = 1e3

// How many times slower the repeated median must be compared to the resolution.
// A lower value makes measures closer to the resolution, making them less
// precise.
// A higher value increases the task loop duration, creating fewer loops.
const MIN_RESOLUTION_PRECISION = 1e2
