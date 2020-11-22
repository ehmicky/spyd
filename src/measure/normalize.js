// Remove `measureCost`, `repeatCost` and `repeat` from measures
// We use `forEach()` instead of `map()` to re-use the allocated array, which
// is faster.
export const normalizeMeasures = function (
  measures,
  { measureCost, repeatCost, repeat },
) {
  if (isMeasureCost({ measureCost, repeatCost, repeat })) {
    return
  }

  measures.forEach((measure, index) => {
    // eslint-disable-next-line fp/no-mutation, no-param-reassign
    measures[index] = normalizeMeasure(measure, {
      measureCost,
      repeatCost,
      repeat,
    })
  })
}

// When computing `measureCost`, there is no bias nor `repeat` to use
const isMeasureCost = function ({ measureCost, repeatCost, repeat }) {
  return measureCost === 0 && repeatCost === 0 && repeat === 1
}

// Return the real measure spent by the task, as opposed to how long spent
// measuring it.
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
const normalizeMeasure = function (
  denormalizedMeasure,
  { measureCost, repeatCost, repeat },
) {
  return Math.max(
    (denormalizedMeasure - measureCost + repeatCost) / repeat - repeatCost,
    0,
  )
}

// Inverse of `normalizeMeasure()`, for how long to measure one `repeat` loop
export const denormalizeMeasure = function (
  normalizedMeasure,
  { measureCost, repeatCost, repeat },
) {
  return (normalizedMeasure + repeatCost) * repeat + measureCost - repeatCost
}

// Inverse of `normalizeMeasure()`, for how long to measure each task inside a
// `repeat` loop
export const denormalizeCallMeasure = function (
  normalizedMeasure,
  { measureCost, repeatCost, repeat },
) {
  return (
    denormalizeMeasure(normalizedMeasure, { measureCost, repeatCost, repeat }) /
    repeat
  )
}
