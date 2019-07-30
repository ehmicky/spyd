import { benchmark } from './temp.js'
import { sendParentMessage, getParentMessage } from './ipc_helpers.js'

// Child process entry point.
// Wait for the parent process to ask it to benchmark the task then send the
// result back to the parent.
const run = async function() {
  await sendParentMessage('ready')

  const duration = await getParentMessage('run')

  const result = benchmark(func, duration)
  await sendParentMessage('result', result)
}

const func = Math.random

run()
