import { spawnOutput, spawnNoOutput } from '../spawn.js'

// Task `before`. Performed outside measurements.
// Its return value is passed as variable {{before}} to `main` and `after`.
export const performBefore = async function ({
  before,
  variables,
  shell,
  debug,
}) {
  if (before === undefined) {
    return variables
  }

  const beforeVariable = await spawnOutput(before, 'Before', {
    variables,
    shell,
    debug,
  })
  return { ...variables, before: beforeVariable }
}

// Task `after`. Performed outside measurements.
export const performAfter = async function ({
  after,
  variables,
  shell,
  debug,
}) {
  if (after === undefined) {
    return
  }

  await spawnNoOutput(after, 'After', { variables, shell, debug })
}
