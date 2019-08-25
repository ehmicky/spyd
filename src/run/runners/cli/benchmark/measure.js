import { now } from '../../../../now.js'
import { spawnCommand, spawnProcess } from '../spawn.js'

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

  const beforeOutput = await spawnCommand(before, { variables, shell, stdio })
  return { ...variables, before: beforeOutput }
}

// Task `after`. Performed outside measurements.
const performAfter = async function({ after, variables, shell, stdio }) {
  if (after === undefined) {
    return
  }

  await spawnProcess(after, { variables, shell, stdio })
}
