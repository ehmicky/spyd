import now from 'precise-now'

import { spawnOutput, spawnNoOutput } from '../spawn.js'

// Main measuring code.
export const measure = async function ({
  main,
  before,
  after,
  variables,
  shell,
  debug,
}) {
  const variablesA = await performBefore({ before, variables, shell, debug })

  const start = now()
  await spawnNoOutput(main, 'Main', { variables: variablesA, shell, debug })
  const time = now() - start

  await performAfter({ after, variables: variablesA, shell, debug })
  return time
}

// Task `before`. Performed outside measurements.
// Its return value is passed as variable {{before}} to `main` and `after`.
const performBefore = async function ({ before, variables, shell, debug }) {
  if (before === undefined) {
    return variables
  }

  const beforeOutput = await spawnOutput(before, 'Before', {
    variables,
    shell,
    debug,
  })
  return { ...variables, before: beforeOutput }
}

// Task `after`. Performed outside measurements.
const performAfter = async function ({ after, variables, shell, debug }) {
  if (after === undefined) {
    return
  }

  await spawnNoOutput(after, 'After', { variables, shell, debug })
}
