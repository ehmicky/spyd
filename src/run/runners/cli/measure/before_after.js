import { spawnOutput, spawnNoOutput } from '../spawn.js'

// Task `before`. Performed outside measurements.
// Its return value is passed as variable {{before}} to `main` and `after`.
export const performBefore = async function ({
  before,
  variables,
  shell,
  debug,
  repeat,
}) {
  if (before === undefined) {
    return
  }

  const beforeArgs = []

  // Each `before` is executed serially to prevent hitting OS resources limits
  // (such as max number of open files)
  // eslint-disable-next-line fp/no-loops, fp/no-mutation, no-plusplus, no-param-reassign
  while (repeat--) {
    // eslint-disable-next-line fp/no-mutating-methods
    beforeArgs.unshift(
      // eslint-disable-next-line no-await-in-loop
      await spawnOutput(before, 'Before', { variables, shell, debug }),
    )
  }

  return beforeArgs
}

// Task `after`. Performed outside measurements.
export const performAfter = async function ({
  after,
  variables,
  shell,
  debug,
  repeat,
  beforeArgs = [],
}) {
  if (after === undefined) {
    return
  }

  // eslint-disable-next-line fp/no-loops, fp/no-mutation, no-plusplus, no-param-reassign
  while (repeat--) {
    // eslint-disable-next-line no-await-in-loop
    await spawnNoOutput(after, 'After', {
      variables: { ...variables, before: beforeArgs[repeat] },
      shell,
      debug,
    })
  }
}
