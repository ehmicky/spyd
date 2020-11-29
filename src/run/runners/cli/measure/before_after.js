import { spawnProcess } from '../spawn.js'

// Task `before`. Performed outside measurements.
// Its return value is passed as variable {{before}} to `main` and `after`.
export const performBefore = async function ({ before, variables, shell }) {
  if (before === undefined) {
    return variables
  }

  const beforeVariable = await spawnProcess(before, {
    variables,
    shell,
    stdout: 'pipeInherit',
    stderr: 'inherit',
  })
  return { ...variables, before: beforeVariable }
}

// Task `after`. Performed outside measurements.
export const performAfter = async function ({ after, variables, shell }) {
  if (after === undefined) {
    return
  }

  await spawnProcess(after, {
    variables,
    shell,
    stdout: 'inherit',
    stderr: 'inherit',
  })
}
