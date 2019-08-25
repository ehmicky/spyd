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
  await performBefore({ before, variables, shell, stdio })
  const start = now()
  await spawnProcess(main, { variables, shell, stdio })
  const time = now() - start
  await performAfter({ after, variables, shell, stdio })
  return time
}

// Task `before`. Performed outside measurements.
// Its return value is passed as variable {{before}} to `main()` and `after()`.
const performBefore = function({ before, variables, shell, stdio }) {
  if (before === undefined) {
    return
  }

  return spawnProcess(before, { variables, shell, stdio })
}

// Task `after`. Performed outside measurements.
const performAfter = function({ after, variables, shell, stdio }) {
  if (after === undefined) {
    return
  }

  return spawnProcess(after, { variables, shell, stdio })
}
