import { now } from '../../../../now.js'

import { spawnProcess } from './spawn.js'

// Main measuring code.
export const measure = async function({ main, before, after, shell, stdio }) {
  const beforeArgs = await performBefore({ before, shell, stdio })
  const start = now()
  await spawnProcess(main, { shell, stdio })
  const time = now() - start
  await performAfter({ after, shell, stdio })
  return time
}

// Task `before`. Performed outside measurements.
// Its return value is passed as variable {{before}} to `main()` and `after()`.
const performBefore = function({ before, shell, stdio }) {
  if (before === undefined) {
    return
  }

  return spawnProcess(before, { shell, stdio })
}

// Task `after`. Performed outside measurements.
const performAfter = function({ after, shell, stdio }) {
  if (after === undefined) {
    return
  }

  return spawnProcess(after, { shell, stdio })
}
