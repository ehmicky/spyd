// Remove `measureCost` and `repeat` from measures
// We use `forEach()` instead of `map()` to re-use the allocated array, which
// is faster.
// Not done during `measureCost` since each measure is the `measureCost` itself,
// and `repeat` is not used.
export const loopDurationsToMedians = function (
  loopDurations,
  { measureCost, repeat, sampleType },
) {
  // Performance optimization since `measureCost`'s costs are 0 and repeat is 1
  if (sampleType === 'measureCost') {
    return loopDurations
  }

  // Somehow this is faster than direct mutation, providing `loopDurations` is
  // not used anymore after this function and can be garbage collected.
  return loopDurations.map((loopDuration) =>
    loopDurationToMedian(loopDuration, measureCost, repeat),
  )
}

// The runner measures loops of the task. This retrieve the mean time to execute
// the task each time, from the time to execute the whole loop.
// Can be negative if the task is faster than `measureCost`, in which case
// `measureCost` variation might be higher than the task duration itself.
// This is only a problem if `repeat` is low enough.
// In that case, we return `0`.
const loopDurationToMedian = function (loopDuration, measureCost, repeat) {
  return Math.max((loopDuration - measureCost) / repeat, 0)
}

// Compute how long does one whole `repeat` loop last
export const medianToLoopDuration = function (median, measureCost, repeat) {
  return median * repeat + measureCost
}

// Compute how long does one `repeat` loop iteration last
export const medianToLoopIteration = function (median, measureCost, repeat) {
  return medianToLoopDuration(median, measureCost, repeat) / repeat
}
