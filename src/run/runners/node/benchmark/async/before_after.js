export const performBeforeAsync = async function (beforeEach, repeat) {
  if (beforeEach === undefined) {
    return
  }

  const beforeArgs = []

  // Each `before` is executed serially to prevent hitting OS resources limits
  // (such as max number of open files)
  // eslint-disable-next-line fp/no-loops, fp/no-mutation, fp/no-let
  for (let index = 0; index !== repeat; index += 1) {
    // eslint-disable-next-line no-await-in-loop, fp/no-mutating-methods
    beforeArgs.push(await beforeEach())
  }

  return beforeArgs
}

export const performAfterAsync = async function (
  afterEach,
  repeat,
  beforeArgs = [],
) {
  if (afterEach === undefined) {
    return
  }

  // eslint-disable-next-line fp/no-loops, fp/no-mutation, fp/no-let
  for (let index = 0; index !== repeat; index += 1) {
    // eslint-disable-next-line no-await-in-loop
    await afterEach(beforeArgs[index])
  }
}
