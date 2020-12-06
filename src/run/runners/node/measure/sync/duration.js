import now from 'precise-now'

// For the same reasons, we have different functions depending on whether
// `beforeArgs` is used because passing an argument to `main()` is slightly
// slower.
export const getDurationSync = function (main, repeat, beforeArgs) {
  if (beforeArgs !== undefined) {
    return getDurationArgsSync(main, repeat, beforeArgs)
  }

  return getDurationNoArgsSync(main, repeat)
}

const getDurationArgsSync = function (main, repeat, beforeArgs) {
  const start = now()

  // eslint-disable-next-line fp/no-loops, fp/no-mutation, fp/no-let
  for (let index = 0; index !== repeat; index += 1) {
    main(beforeArgs[index])
  }

  return now() - start
}

const getDurationNoArgsSync = function (main, repeat) {
  const start = now()

  // eslint-disable-next-line fp/no-loops, fp/no-mutation, fp/no-let
  for (let index = 0; index !== repeat; index += 1) {
    main()
  }

  return now() - start
}
