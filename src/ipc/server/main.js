import { getBarrier } from './barrier.js'
import { handleRequests } from './handler.js'
import { runProcesses } from './process.js'
import { startServer, stopServer } from './start_stop.js'
import { createClientId } from './url.js'

const runCombinations = async function ({ duration }) {
  const combinations = getCombinations()

  const { httpServer, origin } = await startServer(duration)

  try {
    const loadBarrier = getBarrier()
    handleRequests({ combinations, httpServer, loadBarrier })
    await runProcesses({ combinations, origin, duration, loadBarrier })
  } finally {
    await stopServer(httpServer)
  }
}

const getCombinations = function () {
  const combinations = [
    { taskId: 'one' },
    { taskId: 'two' },
    { taskId: 'three' },
  ]
  return combinations.map(addDefaultState)
}

const addDefaultState = function (combination) {
  const clientId = createClientId()
  return { ...combination, clientId, timeSpent: 0, measures: [] }
}

runCombinations({ duration: 1e9 })
