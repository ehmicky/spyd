import { now } from '../../../../now.js'

import { spawnProcess } from './spawn.js'

// Main measuring code.
export const measure = async function({ main, before, after, stdio }) {
  const beforeArgs = await performBefore({ before, stdio })
  const start = now()
  await spawnProcess(main, { stdio })
  const time = now() - start
  await performAfter({ after, stdio })
  return time
}

// Task `before`. Performed outside measurements.
// Its return value is passed as variable {{before}} to `main()` and `after()`.
const performBefore = function({ before, stdio }) {
  if (before === undefined) {
    return
  }

  return spawnProcess(before, { stdio })
}

// Task `after`. Performed outside measurements.
const performAfter = function({ after, stdio }) {
  if (after === undefined) {
    return
  }

  return spawnProcess(after, { stdio })
}
