import { benchmark } from './temp.js'
import { sendParentMessage, getParentMessage } from './ipc_helpers.js'

// Child process entry point.
// Wait for the parent process to ask it to benchmark the task then send the
// result back to the parent.
const run = async function() {
  await sendParentMessage('ready')

  const duration = await getParentMessage('run')

  const result = await benchmark(main, before, after, duration)
  await sendParentMessage('result', result)
}

const before = undefined

const main = Math.random

const after = undefined

run()
