// Task `before()`. Performed outside measurements.
// Its return value is passed to `main()` and `after()`.
// `before`, `main` and `after` must be pure functions. This is because when
// `repeat > 1` `before|after` are executed in chunks instead of one after
// another.
// This is required to be able to loop `main` several times with a single
// `now()` performed.
export const performBeforeSync = function (before, repeat) {
  if (before === undefined) {
    return
  }

  const beforeArgs = Array.from({ length: repeat }, () => before())
  return beforeArgs
}

// Task `after()`. Performed outside measurements.
export const performAfterSync = function (after, repeat, beforeArgs = []) {
  if (after === undefined) {
    return
  }

  // eslint-disable-next-line fp/no-loops, fp/no-mutation, fp/no-let
  for (let index = 0; index !== repeat; index += 1) {
    after(beforeArgs[index])
  }
}
