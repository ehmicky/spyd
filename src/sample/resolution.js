import timeResolution from 'time-resolution'

// If the minimum resolution is too close to the measures, results will not be
// precise enough. We apply the same `repeat` loop method as for `measureCost`
// to prevent this.
// The runner's resolution is the granularity of timestamps and measures.
// This can be different from the OS resolution as the runner (or its
// language/platform) might have a lower resolution.
// We use `time-resolution` to guess the runner's minimum resolution.
// For example, if a runner can only measure things with 1ms precision, every
// nanoseconds measures will be a multiple of 1e6.
// We estimate this using the `emptyMeasures`.
export const getResolution = function (
  resolution,
  resolutionSize,
  emptyMeasures,
) {
  if (
    resolution === MIN_RESOLUTION ||
    resolutionSize >= MAX_RESOLUTION_SAMPLES
  ) {
    return [resolution, resolutionSize]
  }

  const sizeLeft = MAX_RESOLUTION_SAMPLES - resolutionSize
  const emptyMeasuresA =
    emptyMeasures.length <= sizeLeft
      ? emptyMeasures
      : emptyMeasures.slice(0, sizeLeft)
  const newResolution = Math.min(resolution, timeResolution(emptyMeasuresA))
  const newResolutionSize = resolutionSize + emptyMeasuresA.length
  return [newResolution, newResolutionSize]
}

// Minimum resolution from `time-resolution`
const MIN_RESOLUTION = 1
// We do not need more than this amount of samples to get a very good estimate,
// so we stop after that.
const MAX_RESOLUTION_SAMPLES = 1e3
