// eslint-disable-next-line fp/no-events
import { EventEmitter, once } from 'events'

import { getRemainingCombinations, getNextCombination } from './duration.js'
import { findCombinationByUrl } from './url.js'

export const initOrchestrators = function ({
  server,
  combinations,
  benchmarkEnd,
}) {
  const combinationsA = combinations.map(addOrchestrator)
  handleRequests(server, combinationsA)
  addEndHandlers(combinationsA, benchmarkEnd)
  return combinationsA
}

const addOrchestrator = function (combination) {
  const orchestrator = new EventEmitter()
  return { ...combination, orchestrator }
}

// Handle HTTP requests coming from runners
const handleRequests = function (server, combinations) {
  server.on('request', (req, res) => {
    handleRequest(combinations, req, res)
  })
}

const handleRequest = function (combinations, req, res) {
  const { orchestrator } = findCombinationByUrl(req, combinations)
  orchestrator.emit('output', { req, res })
}

const addEndHandlers = function (combinations, benchmarkEnd) {
  const state = { pending: combinations.length - 1 }
  combinations.forEach(({ orchestrator }) => {
    addEndHandler({ orchestrator, combinations, state, benchmarkEnd })
  })
}

const addEndHandler = function ({
  orchestrator,
  combinations,
  state,
  benchmarkEnd,
}) {
  orchestrator.on('end', () => {
    onSampleEnd({ combinations, state, benchmarkEnd })
  })
}

const onSampleEnd = function ({ combinations, state, benchmarkEnd }) {
  if (state.pending !== 0) {
    // eslint-disable-next-line fp/no-mutation, no-param-reassign
    state.pending -= 1
    return
  }

  const remainingCombinations = getRemainingCombinations(
    combinations,
    benchmarkEnd,
  )

  if (shouldExitBenchmark(remainingCombinations)) {
    exitCombinations(combinations)
    return
  }

  const { orchestrator } = getNextCombination(remainingCombinations)
  orchestrator.emit('start', true)
}

const shouldExitBenchmark = function (remainingCombinations) {
  return remainingCombinations.length === 0
}

const exitCombinations = function (combinations) {
  combinations.forEach(exitCombination)
}

const exitCombination = function ({ orchestrator }) {
  orchestrator.emit('start', false)
}

// We must listen to the event before potentially emitting it
export const waitForStart = async function (orchestrator) {
  const [[shouldExit]] = await Promise.all([
    once(orchestrator, 'start'),
    orchestrator.emit('end'),
  ])
  return shouldExit
}

export const waitForOutput = async function (orchestrator) {
  const [{ req, res }] = await once(orchestrator, 'output')
  return { req, res }
}
