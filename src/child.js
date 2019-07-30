import { benchmark } from './temp.js'
import { sendParentMessage, getParentMessage } from './ipc_helpers.js'
import { loadTask } from './tasks.js'

// Child process entry point.
// Wait for the parent process to ask it to benchmark the task then send the
// result back to the parent.
const run = async function() {
  await sendParentMessage('ready')

  const { taskPath, task, parameter } = await getParentMessage('load')

  const { main, before, after } = loadTask(taskPath, task, parameter)

  const duration = await getParentMessage('run')

  const result = await benchmark(main, before, after, duration)
  await sendParentMessage('result', result)
}

run()
