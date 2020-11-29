// Remove `measureCost`, `repeatCost` and `repeat` from measures
// We use `forEach()` instead of `map()` to re-use the allocated array, which
// is faster.
// Not done during `measureCost` since each measure is the `measureCost` itself,
// and `repeat` is not used.
export const loopDurationsToMedians = function (
  loopDurations,
  { measureCost, repeatCost, repeat, sampleType },
) {
  // Performance optimization since `measureCost`'s costs are 0 and repeat is 1
  if (sampleType === 'measureCost') {
    return
  }

  loopDurations.forEach((loopDuration, index) => {
    // eslint-disable-next-line fp/no-mutation, no-param-reassign
    loopDurations[index] = loopDurationToMedian(loopDuration, {
      measureCost,
      repeatCost,
      repeat,
    })
  })
}

// The runner measures loops of the task. This retrieve the mean time to execute
// the task each time, from the time to execute the whole loop.
// Can be negative if:
//   - The task is faster than `measureCost`, in which case `measureCost`
//     variation might be higher than the task duration itself. This is only a
//     problem if `repeat` is low enough.
//   - The task is faster than `repeatCost`, in which case it is impossible to
//     dissociate how long it spent on the runner's loop logic from the task.
// In both cases, we return `0`.
// `measureCost` includes 1 round of the loop, which is why we add `repeatCost`
// to measure how long to perform the loop itself (with no rounds). Also, this
// means that if `repeat` is `1`, `repeatCost` will have no impact on the
// measure, which means its variance will not add to the overall variance.
const loopDurationToMedian = function (
  loopDuration,
  { measureCost, repeatCost, repeat },
) {
  return Math.max(
    (loopDuration - measureCost + repeatCost) / repeat - repeatCost,
    0,
  )
}

// Compute how long does one whole `repeat` loop last
export const medianToLoopDuration = function (
  median,
  { measureCost, repeatCost, repeat },
) {
  return (median + repeatCost) * repeat + measureCost - repeatCost
}

// Compute how long does one `repeat` loop iteration last
export const medianToLoopIteration = function (
  median,
  { measureCost, repeatCost, repeat },
) {
  return (
    medianToLoopDuration(median, { measureCost, repeatCost, repeat }) / repeat
  )
}
