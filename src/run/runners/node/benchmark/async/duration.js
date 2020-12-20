import now from 'precise-now'

export const getDurationAsync = function (main, repeat, beforeArgs) {
  if (beforeArgs !== undefined) {
    return getDurationArgsAsync(main, repeat, beforeArgs)
  }

  return getDurationNoArgsAsync(main, repeat)
}

const getDurationArgsAsync = async function (main, repeat, beforeArgs) {
  const start = now()

  // eslint-disable-next-line fp/no-loops, fp/no-mutation, fp/no-let
  for (let index = 0; index !== repeat; index += 1) {
    // eslint-disable-next-line no-await-in-loop
    await main(beforeArgs[index])
  }

  return now() - start
}

const getDurationNoArgsAsync = async function (main, repeat) {
  const start = now()

  // eslint-disable-next-line fp/no-loops, fp/no-mutation, fp/no-let
  for (let index = 0; index !== repeat; index += 1) {
    // eslint-disable-next-line no-await-in-loop
    await main()
  }

  return now() - start
}
