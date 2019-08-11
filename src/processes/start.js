import { spawn } from 'child_process'

import getStream from 'get-stream'

import { getChildMessage, sendChildMessage } from './ipc.js'

export const startChild = async function({
  taskPath,
  commandValue: [file, ...args],
  commandOpt,
  cwd,
}) {
  const child = spawn(file, args, {
    stdio: ['ignore', 'ignore', 'pipe', 'ipc'],
    cwd,
  })
  // eslint-disable-next-line fp/no-mutation
  child.stderrPromise = getStream(child.stderr)

  // Wait for child process to be ready to listen
  await getChildMessage(child, 'ready')

  // Communicate to the child process which task to load
  await sendChildMessage(child, 'load', { taskPath, opts: commandOpt })

  const { iterations } = await getChildMessage(child, 'load')

  return { iterations, child }
}
