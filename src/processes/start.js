import { spawn } from 'child_process'

import { getChildMessage, sendChildMessage } from './ipc.js'

const CHILD_MAIN = `${__dirname}/child.js`

// We boot several child processes at once in parallel because it is slow.
// We do it in-between benchmarks because it would slow them down and add
// variance.
export const startChildren = async function({ taskPath, taskId, parameter }) {
  const promises = Array.from({ length: POOL_SIZE }, () =>
    startChild({ taskPath, taskId, parameter }),
  )
  const children = await Promise.all(promises)
  return children
}

// Same as `PROCESS_COUNT`
const POOL_SIZE = 2e1

const startChild = async function({ taskPath, taskId, parameter }) {
  const child = spawn('node', [CHILD_MAIN], {
    stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
  })

  await getChildMessage(child, 'ready')

  await sendChildMessage(child, 'load', { taskPath, taskId, parameter })

  return child
}
