export const performBeforeAsync = async function (before, repeat) {
  if (before === undefined) {
    return
  }

  const beforeArgs = []

  // eslint-disable-next-line fp/no-loops, fp/no-mutation, no-plusplus, no-param-reassign
  while (repeat--) {
    // Each `before` is run serially to prevent hitting OS resources limits
    // (such as max number of open files)
    // eslint-disable-next-line no-await-in-loop, fp/no-mutating-methods
    beforeArgs.unshift(await before())
  }

  return beforeArgs
}

export const performAfterAsync = async function (
  after,
  repeat,
  beforeArgs = [],
) {
  if (after === undefined) {
    return
  }

  // eslint-disable-next-line fp/no-loops, fp/no-mutation, no-plusplus, no-param-reassign
  while (repeat--) {
    // eslint-disable-next-line no-await-in-loop
    await after(beforeArgs[repeat])
  }
}
