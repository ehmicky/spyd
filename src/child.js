import { execute } from './execute.js'
import { sendParentMessage, getParentMessage } from './ipc_helpers.js'

// Child process entry point.
// Wait for the parent process to ask it to benchmark the task then send the
// result back to the parent.
const run = async function() {
  await sendParentMessage('ready')

  const duration = await getParentMessage('run')

  const time = execute(duration)
  await sendParentMessage('time', time)
}

run()
