import { spawn } from 'child_process'

import getStream from 'get-stream'

import { getRunner } from '../run/main.js'

import { getChildMessage, sendChildMessage } from './ipc.js'

// We boot several child processes at once in parallel because it is slow.
// This includes loading the task file.
// We do it in-between benchmarks because it would slow them down and add
// variance.
export const startChildren = async function({ taskPath, requireOpt }) {
  const promises = Array.from({ length: POOL_SIZE }, () =>
    startChild({ taskPath, requireOpt }),
  )
  const results = await Promise.all(promises)
  const children = results.map(getChild)
  return children
}

// Same as `PROCESS_COUNT`
const POOL_SIZE = 2e1

export const startChild = async function({ taskPath, requireOpt }) {
  const {
    command: [file, ...args],
  } = getRunner(taskPath)
  const child = spawn(file, args, {
    stdio: ['ignore', 'ignore', 'pipe', 'ipc'],
  })
  // eslint-disable-next-line fp/no-mutation
  child.stderrPromise = getStream(child.stderr)

  // Wait for child process to be ready to listen
  await getChildMessage(child, 'ready')

  // Communicate to the child process which task to load
  await sendChildMessage(child, 'load', { taskPath, requireOpt })

  const { iterations } = await getChildMessage(child, 'load')

  return { iterations, child }
}

const getChild = function({ child }) {
  return child
}
