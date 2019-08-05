import { benchmark } from '../benchmark/main.js'
import { loadTaskFile } from '../load/main.js'

import { sendParentMessage, getParentMessage } from './ipc.js'

// Child process entry point.
// Wait for the parent process to request benchmarks then send the result back
// to the parent.
const run = async function() {
  try {
    await sendParentMessage('ready')

    const {
      taskPath,
      taskId,
      variationId,
      requireOpt,
    } = await getParentMessage('load')

    const iterations = await loadTaskFile(taskPath, requireOpt)

    const { main, before, after } = iterations.find(
      iteration =>
        iteration.taskId === taskId && iteration.variationId === variationId,
    )

    const duration = await getParentMessage('run')

    const result = await benchmark({ main, before, after, duration })
    await sendParentMessage('result', result)
  } catch (error) {
    // This will be printed to stderr, which means parent will print it
    // eslint-disable-next-line no-console, no-restricted-globals
    console.error(error)
  }
}

run()
