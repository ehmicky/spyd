import { benchmark } from '../measure/main.js'
import { getTask } from '../tasks/get.js'

import { sendParentMessage, getParentMessage } from './ipc.js'

// Child process entry point.
// Wait for the parent process to ask it to benchmark the task then send the
// result back to the parent.
const run = async function() {
  await sendParentMessage('ready')

  const { taskPath, taskId, parameter } = await getParentMessage('load')

  const { main, before, after } = await getTask(taskPath, taskId, parameter)

  const duration = await getParentMessage('run')

  const result = await benchmark(main, before, after, duration)
  await sendParentMessage('result', result)
}

run()
