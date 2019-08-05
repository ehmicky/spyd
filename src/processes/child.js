import { benchmark } from '../benchmark/main.js'
import { getTask } from '../tasks/get.js'

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

    const { main, before, after } = await getTask({
      taskPath,
      taskId,
      variationId,
      requireOpt,
    })

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
