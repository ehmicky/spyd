// Task `before()`. Performed outside measurements.
// Its return value is passed to `main()` and `after()`.
// Can be async. Run serially to prevent hitting OS resources limits (such as
// max number of open files)
export const performBefore = async function (before, repeat) {
  if (before === undefined) {
    return
  }

  const beforeArgs = []

  // eslint-disable-next-line fp/no-loops, fp/no-let, fp/no-mutation
  for (let index = 0; index < repeat; index++) {
    // eslint-disable-next-line no-await-in-loop, fp/no-mutating-methods
    beforeArgs.push(await before())
  }

  return beforeArgs
}

// Task `after()`. Performed outside measurements. Can be async.
export const performAfter = async function (after, repeat, beforeArgs = []) {
  if (after === undefined) {
    return
  }

  // eslint-disable-next-line fp/no-loops, fp/no-let, fp/no-mutation
  for (let index = 0; index < repeat; index++) {
    // eslint-disable-next-line no-await-in-loop
    await after(beforeArgs[index])
  }
}
