// Remove `measureCost`, `repeatCost` and `repeat` from measured `times`
// We use `forEach()` instead of `map()` to re-use the allocated array, which
// is faster.
export const normalizeTimes = function (
  times,
  { measureCost, repeatCost, repeat },
) {
  if (isMeasureCost({ measureCost, repeatCost, repeat })) {
    return
  }

  times.forEach((time, index) => {
    // eslint-disable-next-line fp/no-mutation, no-param-reassign
    times[index] = normalizeTime(time, { measureCost, repeatCost, repeat })
  })
}

// When computing `measureCost`, there is no bias nor `repeat` to use
const isMeasureCost = function ({ measureCost, repeatCost, repeat }) {
  return measureCost === 0 && repeatCost === 0 && repeat === 1
}

// Return the real time spent by the task, as opposed to time spent measuring it
// `time` can be negative if:
//   - The task is faster than `measureCost`, in which case `measureCost`
//     variation might be higher than the task duration itself. This is only a
//     problem if `repeat` is low enough.
//   - The task is faster than `repeatCost`, in which case it is impossible to
//     dissociate the time spent on the runner's loop logic from the task.
// In both cases, we return `0`.
// `measureCost` includes 1 round of the loop, which is why we add `repeatCost`
// to get the time to perform the loop itself (with no rounds). Also, this means
// that if `repeat` is `1`, `repeatCost` will have no impact on the measure,
// which means its variance will not add to the overall variance.
const normalizeTime = function (
  denormalizedTime,
  { measureCost, repeatCost, repeat },
) {
  return Math.max(
    (denormalizedTime - measureCost + repeatCost) / repeat - repeatCost,
    0,
  )
}

// Inverse of `normalizeTime()`, for the time to measure one `repeat` loop
export const denormalizeTime = function (
  normalizedTime,
  { measureCost, repeatCost, repeat },
) {
  return (normalizedTime + repeatCost) * repeat + measureCost - repeatCost
}

// Inverse of `normalizeTime()`, for the time to measure each task inside a
// `repeat` loop
export const denormalizeTimePerCall = function (
  normalizedTime,
  { measureCost, repeatCost, repeat },
) {
  return (
    denormalizeTime(normalizedTime, { measureCost, repeatCost, repeat }) /
    repeat
  )
}
