import { initOrchestrators } from './orchestrator.js'
import { runProcesses } from './process.js'
import { startServer, stopServer } from './start_stop.js'
import { createClientId } from './url.js'

const runCombinations = async function ({ duration }) {
  const combinations = getCombinations()

  const { server, origin } = await startServer(duration)

  try {
    const combinationsA = initOrchestrators(server, combinations)
    await runProcesses({ combinations: combinationsA, origin, duration })
  } finally {
    await stopServer(server)
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
  return {
    ...combination,
    clientId,
    state: { timeSpent: 0, processes: 0, measures: [] },
  }
}

runCombinations({ duration: 1e9 })
