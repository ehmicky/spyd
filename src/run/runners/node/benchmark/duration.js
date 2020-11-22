import now from 'precise-now'

// For the same reasons, we have different functions depending on whether
// `beforeArgs` is used because passing an argument to `main()` is slightly
// slower.
export const getDurationAsync = function (main, repeat, beforeArgs) {
  if (beforeArgs !== undefined) {
    return getDurationArgsAsync(main, repeat, beforeArgs)
  }

  return getDurationNoArgsAsync(main, repeat)
}

export const getDurationSync = function (main, repeat, beforeArgs) {
  if (beforeArgs !== undefined) {
    return getDurationArgsSync(main, repeat, beforeArgs)
  }

  return getDurationNoArgsSync(main, repeat)
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

const getDurationArgsSync = function (main, repeat, beforeArgs) {
  const start = now()

  // eslint-disable-next-line no-param-reassign, no-plusplus, fp/no-mutation, fp/no-loops
  while (repeat--) {
    main(beforeArgs[repeat])
  }

  return now() - start
}

const getDurationNoArgsSync = function (main, repeat) {
  const start = now()

  // eslint-disable-next-line no-param-reassign, no-plusplus, fp/no-mutation, fp/no-loops
  while (repeat--) {
    main()
  }

  return now() - start
}
