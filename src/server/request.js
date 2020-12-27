// eslint-disable-next-line fp/no-events
import { EventEmitter } from 'events'

import { findCombinationByUrl } from './url.js'

// Handle HTTP requests coming from runners.
// Emit a `return` event to communicate it to the proper combination.
export const handleRequests = function (server, combinations) {
  const combinationsA = combinations.map(addServerChannel)
  server.on('request', (req, res) => {
    handleRequest(combinationsA, req, res)
  })
  return combinationsA
}

// HTTP server requests use events. We need to create an EventEmitter to
// propagate each request to the right combintion.
const addServerChannel = function (combination) {
  const serverChannel = new EventEmitter()
  return { ...combination, serverChannel }
}

const handleRequest = function (combinations, req, res) {
  const { serverChannel, error } = findCombinationByUrl(req, combinations)

  if (error !== undefined) {
    emitInvalidReturn({ combinations, req, res, error })
    return
  }

  emitReturn({ serverChannel, req, res })
}

// If no combination can be found, send an error to any combination currently
// listening
const emitInvalidReturn = function ({ combinations, req, res, error }) {
  combinations.forEach(({ serverChannel }) => {
    emitReturn({ serverChannel, req, res, error })
  })
}

const emitReturn = function ({ serverChannel, req, res, error }) {
  serverChannel.emit('return', { req, res, error })
}
