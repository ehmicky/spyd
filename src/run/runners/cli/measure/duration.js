import now from 'precise-now'

import { spawnNoOutput } from '../spawn.js'

export const getDuration = async function ({
  main,
  variables,
  shell,
  debug,
  repeat,
  beforeArgs,
}) {
  const start = now()

  // eslint-disable-next-line no-param-reassign, no-plusplus, fp/no-mutation, fp/no-loops
  while (repeat--) {
    // eslint-disable-next-line no-await-in-loop
    await spawnNoOutput(main, 'Main', {
      variables: { ...variables, before: beforeArgs[repeat] },
      shell,
      debug,
    })
  }

  return now() - start
}
