// Task `beforeEach()`. Performed outside measurements.
// Its return value is passed to `main()` and `afterEach()`.
// `beforeEach`, `main` and `afterEach` must be pure functions. This is because
// when `repeat > 1` `beforeEach|afterEach` are executed in chunks instead of
// one after another.
// This is required to be able to loop `main` several times with a single
// `now()` performed.
export const performBeforeSync = function (beforeEach, repeat) {
  if (beforeEach === undefined) {
    return
  }

  const beforeArgs = Array.from({ length: repeat }, () => beforeEach())
  return beforeArgs
}

// Task `after()`. Performed outside measurements.
export const performAfterSync = function (afterEach, repeat, beforeArgs = []) {
  if (afterEach === undefined) {
    return
  }

  // eslint-disable-next-line fp/no-loops, fp/no-mutation, fp/no-let
  for (let index = 0; index !== repeat; index += 1) {
    afterEach(beforeArgs[index])
  }
}
