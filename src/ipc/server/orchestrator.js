// eslint-disable-next-line fp/no-events
import { EventEmitter, once } from 'events'

import { getNextCombination } from './duration.js'
import { findCombinationByUrl } from './url.js'

export const initOrchestrators = function (server, combinations) {
  const combinationsA = combinations.map(addOrchestrator)
  handleRequests(server, combinationsA)
  addEndHandlers(combinationsA)
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

const addEndHandlers = function (combinations) {
  const state = { pending: combinations.length - 1 }
  combinations.forEach(({ orchestrator }) => {
    addEndHandler({ orchestrator, combinations, state })
  })
}

const addEndHandler = function ({ orchestrator, combinations, state }) {
  orchestrator.on('end', () => {
    onSampleEnd(combinations, state)
  })
}

const onSampleEnd = function (combinations, state) {
  if (state.pending !== 0) {
    // eslint-disable-next-line fp/no-mutation, no-param-reassign
    state.pending -= 1
    return
  }

  const { orchestrator } = getNextCombination(combinations)
  orchestrator.emit('start')
}

// We must listen to the event before potentially emitting it
export const waitForStart = async function (orchestrator) {
  await Promise.all([once(orchestrator, 'start'), orchestrator.emit('end')])
}

export const waitForOutput = async function (orchestrator) {
  const [{ req, res }] = await once(orchestrator, 'output')
  return { req, res }
}
