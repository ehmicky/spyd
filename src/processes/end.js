import { sendChildMessage } from './ipc.js'
import { getExit, forwardChildError } from './exit.js'

// Wait for child process exit. Forward any termination errors.
export const endChild = async function(child) {
  await sendChildMessage(child, 'end')

  child.disconnect()

  const { exitCode, signal } = await getExit(child)

  if (exitCode === 0 && signal === null) {
    return
  }

  forwardChildError(signal, exitCode)
}
