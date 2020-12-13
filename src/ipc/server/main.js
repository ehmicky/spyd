import { handleRequests } from './handler.js'
import { runProcesses } from './process.js'
import { startServer, stopServer } from './start_stop.js'
import { createClientId } from './url.js'
import { createBarrier } from './wait.js'

const runCombinations = async function ({ duration }) {
  const combinations = getCombinations()

  const { httpServer, origin } = await startServer(duration)

  try {
    handleRequests(combinations, httpServer)
    await runProcesses({ combinations, origin, duration })
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
  const barriers = { load: createBarrier(), start: createBarrier() }
  return { ...combination, clientId, barriers, timeSpent: 0, measures: [] }
}

runCombinations({ duration: 1e9 })
