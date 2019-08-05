import { sendParentMessage, getParentMessage } from '../../processes/ipc.js'

import { benchmark } from './benchmark/main.js'
import { loadTaskFile } from './load/main.js'

// Child process entry point.
// Wait for the parent process to request benchmarks then send the result back
// to the parent.
// eslint-disable-next-line max-statements
const run = async function() {
  try {
    await sendParentMessage('ready')

    const { taskPath, requireOpt, skip } = await getParentMessage('load')

    const iterations = await loadTaskFile(taskPath, requireOpt)

    const loadEvent = getLoadEvent(iterations)

    await sendParentMessage('load', loadEvent)

    if (skip) {
      return
    }

    const { taskId, variationId, duration } = await getParentMessage('run')

    const { main, before, after } = iterations.find(
      iteration =>
        iteration.taskId === taskId && iteration.variationId === variationId,
    )

    const { times, count } = await benchmark({ main, before, after, duration })
    await sendParentMessage('run', { times, count })
  } catch (error) {
    // This will be printed to stderr, which means parent will print it
    // eslint-disable-next-line no-console, no-restricted-globals
    console.error(error)
  }
}

const getLoadEvent = function(iterations) {
  const iterationsA = iterations.map(getIteration)
  return { iterations: iterationsA }
}

const getIteration = function({
  taskId,
  taskTitle,
  variationId,
  variationTitle,
}) {
  return { taskId, taskTitle, variationId, variationTitle }
}

run()
