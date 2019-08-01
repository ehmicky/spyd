// Update some state on each iteration
export const updateState = function(
  { times, count, repeat: previousRepeat, iterIndex },
  time,
  repeat,
) {
  const { times: timesA, count: countA } = resetState({
    times,
    count,
    repeat,
    previousRepeat,
    iterIndex,
  })

  // We directly mutate `times` because it's much faster since it's a big array
  // eslint-disable-next-line fp/no-mutating-methods
  timesA.push(time)

  return {
    times: timesA,
    count: countA + repeat,
    repeat,
    iterIndex: iterIndex + 1,
  }
}

const resetState = function({
  times,
  count,
  repeat,
  previousRepeat,
  iterIndex,
}) {
  if (isSameRepeat(previousRepeat, repeat) && !isSlowStart(iterIndex)) {
    return { times, count }
  }

  // eslint-disable-next-line fp/no-mutating-methods
  times.splice(0)

  return { times, count: 0 }
}

// When `repeat` changes too much, we discard previously computed times.
// This is because mixing times computed with different `repeat` is not
// statistically significant. Different `repeat` give different times due to
// bias correction and JavaScript engine loop optimizations.
// However `repeat` always eventually stabilizes.
const isSameRepeat = function(previousRepeat, repeat) {
  return Math.abs(repeat - previousRepeat) / previousRepeat <= MIN_REPEAT_DIFF
}

// Minimum percentage of change to trigger a state reset
const MIN_REPEAT_DIFF = 0.1

// Due to some JavaScript engine optimization, the first run of a function is
// much slower than the next calls. For example running an empty function
// might be 1000 times slower on the first call. So we always remove it.
// Except when there is only enough `duration` to run `main()` once.
const isSlowStart = function(iterIndex) {
  return iterIndex === 1
}
