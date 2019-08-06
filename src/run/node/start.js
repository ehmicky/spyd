import { sendParentMessage, getParentMessage } from '../../processes/ipc.js'

import { benchmark } from './benchmark/main.js'
import { loadTaskFile } from './load/main.js'

// Child process entry point.
// Wait for the parent process to request benchmarks then send the result back
// to the parent.
const start = async function() {
  try {
    await sendParentMessage('ready')

    const iterations = await load()

    await Promise.race([runIteration(iterations), getParentMessage('end')])
  } catch (error) {
    // This will be printed to stderr, which means parent will print it
    // eslint-disable-next-line no-console, no-restricted-globals
    console.error(error)
  }
}

const load = async function() {
  const { taskPath, opts } = await getParentMessage('load')

  const { iterations, loadEvent } = await loadTaskFile(taskPath, opts)

  await sendParentMessage('load', loadEvent)

  return iterations
}

const runIteration = async function(iterations) {
  const { taskId, variationId, duration } = await getParentMessage('run')

  const { main, before, after } = iterations.find(
    iteration =>
      iteration.taskId === taskId && iteration.variationId === variationId,
  )
  const { times, count } = await benchmark({ main, before, after, duration })

  await sendParentMessage('run', { times, count })
}

start()
