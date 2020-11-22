// Remove `nowBias`, `repeatCost` and `repeat` from measured `times`
// We use `forEach()` instead of `map()` to re-use the allocated array, which
// is faster.
export const normalizeTimes = function (
  times,
  { nowBias, repeatCost, repeat },
) {
  if (isNowBias({ nowBias, repeatCost, repeat })) {
    return
  }

  times.forEach((time, index) => {
    // eslint-disable-next-line fp/no-mutation, no-param-reassign
    times[index] = normalizeTime(time, { nowBias, repeatCost, repeat })
  })
}

// When computing `nowBias`, there is no bias nor `repeat` to use
const isNowBias = function ({ nowBias, repeatCost, repeat }) {
  return nowBias === 0 && repeatCost === 0 && repeat === 1
}

// Return the real time spent by the task, as opposed to time spent measuring it
// `time` can be negative if:
//   - The task is faster than `nowBias`, in which case `nowBias` variation
//     might be higher than the task duration itself. This is only a problem
//     if `repeat` is low enough.
//   - The task is faster than `repeatCost`, in which case it is impossible to
//     dissociate the time spent on the runner's loop logic from the task.
// In both cases, we return `0`.
// `nowBias` includes 1 round of the loop, which is why we add `repeatCost` to
// get the time to perform the loop itself (with no rounds). Also, this means
// that if `repeat` is `1`, `repeatCost` will have no impact on the measure,
// which means its variance will not add to the overall variance.
const normalizeTime = function (
  denormalizedTime,
  { nowBias, repeatCost, repeat },
) {
  return Math.max(
    (denormalizedTime - nowBias + repeatCost) / repeat - repeatCost,
    0,
  )
}

// Inverse of `normalizeTime()`, for the time to measure one `repeat` loop
export const denormalizeTime = function (
  normalizedTime,
  { nowBias, repeatCost, repeat },
) {
  return (normalizedTime + repeatCost) * repeat + nowBias - repeatCost
}

// Inverse of `normalizeTime()`, for the time to measure each task inside a
// `repeat` loop
export const denormalizeTimePerCall = function (
  normalizedTime,
  { nowBias, repeatCost, repeat },
) {
  return (
    denormalizeTime(normalizedTime, { nowBias, repeatCost, repeat }) / repeat
  )
}
