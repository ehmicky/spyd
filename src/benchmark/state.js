// Update iteration state
export const updateState = function(state, repeat) {
  resetState(state, repeat)

  // eslint-disable-next-line no-param-reassign, fp/no-mutation
  state.count += repeat
  // eslint-disable-next-line no-param-reassign, fp/no-mutation
  state.repeat = repeat
  // eslint-disable-next-line no-param-reassign, fp/no-mutation
  state.iterIndex += 1
}

const resetState = function(state, repeat) {
  if (isSameRepeat(state, repeat) && !isSlowStart(state)) {
    return
  }

  // eslint-disable-next-line no-param-reassign, fp/no-mutation
  state.times = []
  // eslint-disable-next-line no-param-reassign, fp/no-mutation
  state.count = 0
}

// When `repeat` changes too much, we discard previously computed times.
// This is because mixing times computed with different `repeat` is bad.
// Different `repeat` give different times due to bias correction and JavaScript
// engine loop optimizations.
// However `repeat` always eventually stabilizes.
const isSameRepeat = function(state, repeat) {
  return Math.abs(repeat - state.repeat) / state.repeat <= MIN_REPEAT_DIFF
}

const MIN_REPEAT_DIFF = 0.1

// Due to some JavaScript engine optimization, the first run of a function is
// much slower than the next calls. For example running an empty function
// might be 1000 times slower on the first call. So we remove it.
// Except when there is only enough `duration` to run `main()` once.
const isSlowStart = function(state) {
  return state.iterIndex === 1
}
