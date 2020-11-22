import now from 'precise-now'

export const getDurationAsync = function (main, repeat, beforeArgs) {
  if (beforeArgs !== undefined) {
    return getDurationArgsAsync(main, repeat, beforeArgs)
  }

  return getDurationNoArgsAsync(main, repeat)
}

const getDurationArgsAsync = async function (main, repeat, beforeArgs) {
  const start = now()

  // eslint-disable-next-line no-param-reassign, no-plusplus, fp/no-mutation, fp/no-loops
  while (repeat--) {
    // eslint-disable-next-line no-await-in-loop
    await main(beforeArgs[repeat])
  }

  return now() - start
}

const getDurationNoArgsAsync = async function (main, repeat) {
  const start = now()

  // eslint-disable-next-line no-param-reassign, no-plusplus, fp/no-mutation, fp/no-loops
  while (repeat--) {
    // eslint-disable-next-line no-await-in-loop
    await main()
  }

  return now() - start
}
