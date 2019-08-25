import { now } from '../../../../now.js'

import { spawnProcess } from './spawn.js'

// Main measuring code.
export const measure = async function({
  main,
  before,
  after,
  variables,
  shell,
  stdio,
}) {
  const variablesA = await performBefore({ before, variables, shell, stdio })

  const start = now()
  await spawnProcess(main, { variables: variablesA, shell, stdio })
  const time = now() - start

  await performAfter({ after, variables: variablesA, shell, stdio })
  return time
}

// Task `before`. Performed outside measurements.
// Its return value is passed as variable <<before>> to `main()` and `after()`.
const performBefore = async function({ before, variables, shell, stdio }) {
  if (before === undefined) {
    return variables
  }

  const { stdout: beforeOutput } = await spawnProcess(before, {
    variables,
    shell,
    stdio: ['ignore', 'pipe', stdio],
  })

  // In debug mode, we need to print every command's output
  if (stdio === 'inherit' && beforeOutput !== '') {
    // eslint-disable-next-line no-restricted-globals, no-console
    console.log(beforeOutput)
  }

  return { ...variables, before: beforeOutput }
}

// Task `after`. Performed outside measurements.
const performAfter = async function({ after, variables, shell, stdio }) {
  if (after === undefined) {
    return
  }

  await spawnProcess(after, { variables, shell, stdio })
}
