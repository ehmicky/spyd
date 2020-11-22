// Remove `nowBias`, `loopBias` and `repeat` from measured `times`
// We use `forEach()` instead of `map()` to re-use the allocated array, which
// is faster.
export const normalizeTimes = function (times, { nowBias, loopBias, repeat }) {
  times.forEach((time, index) => {
    normalizeTime({ time, times, index, nowBias, loopBias, repeat })
  })
}

// `time` can be negative if:
//   - The task is faster than `nowBias`, in which case `nowBias` variation
//     might be higher than the task duration itself. This is only a problem
//     if `repeat` is low enough.
//   - The task is faster than `loopBias`, in which case it is impossible to
//     dissociate the time spent on the runner's loop logic from the task.
// In both cases, we return `0`.
// `nowBias` includes 1 round of the loop, which is why we add `loopBias` to get
// the time to perform the loop itself (with no rounds). Also, this means that
// if `repeat` is `1`, `loopBias` will have no impact on the result, which means
// its variance will not add to the overall variance.
const normalizeTime = function ({
  time,
  times,
  index,
  nowBias,
  loopBias,
  repeat,
}) {
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  times[index] = Math.max((time - nowBias + loopBias) / repeat - loopBias, 0)
}
