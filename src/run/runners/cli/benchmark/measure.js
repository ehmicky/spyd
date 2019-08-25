import { now } from '../../../../now.js'

import { spawnProcess } from './spawn.js'

// Main measuring code.
export const measure = async function({
  main,
  before,
  after,
  variation,
  shell,
  stdio,
}) {
  const beforeArgs = await performBefore({ before, variation, shell, stdio })
  const start = now()
  await spawnProcess(main, { variation, shell, stdio })
  const time = now() - start
  await performAfter({ after, variation, shell, stdio })
  return time
}

// Task `before`. Performed outside measurements.
// Its return value is passed as variable {{before}} to `main()` and `after()`.
const performBefore = function({ before, variation, shell, stdio }) {
  if (before === undefined) {
    return
  }

  return spawnProcess(before, { variation, shell, stdio })
}

// Task `after`. Performed outside measurements.
const performAfter = function({ after, variation, shell, stdio }) {
  if (after === undefined) {
    return
  }

  return spawnProcess(after, { variation, shell, stdio })
}
