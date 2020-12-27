// eslint-disable-next-line fp/no-events
import { EventEmitter } from 'events'
import { createServer } from 'http'
import { promisify } from 'util'

import { PluginError } from '../error/main.js'

// Start a local HTTP server to communicate with runner processes.
// We use HTTP instead of other IPC mechanisms:
//  - Signals and named pipes are not easy to make cross-platform
//  - Using shared memory (like files) requires runners to poll, which is slower
//    and makes them compute for CPU and I/O
// We use HTTP instead of other protocols:
//  - Handle both request/response exchange (unlike TCP)
//  - Stateless (unlike Websocket), making it easier to implement and avoiding
//    any cleanup issues
//  - Automatically separate different requests (unlike TCP)
//  - Well-known protocol, easy to implement for any runner, notably in browsers
//  - The performance is not the best, but it pretty ok when using a local
//    server. No TCP re-connection performance issues thanks to
//    `keepAliveTimeout`
// We use the default `requestTimeout` since we are using long polling.
// Keeping the default `headersTimeout` (1 minute) is fine though.
export const startServer = async function (combinations, duration) {
  const server = createServer()
  const combinationsA = handleRequests({ server, combinations, duration })
  const origin = await serverListen(server)
  return { server, origin, combinations: combinationsA }
}

// Handle HTTP requests coming from runners.
// Emit a `return` event to communicate it to the proper combination.
const handleRequests = function ({ server, combinations, duration }) {
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  server.keepAliveTimeout = Math.ceil(duration / NANOSECS_TO_MILLISECS)

  const combinationsA = combinations.map(addServerChannel)
  server.on('request', (req, res) => {
    handleRequest(combinationsA, req, res)
  })
  return combinationsA
}

const NANOSECS_TO_MILLISECS = 1e6

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

// When a request is made, we find the matching combination
const findCombinationByUrl = function (req, combinations) {
  const tokens = SERVER_URL_REGEXP.exec(req.url)

  if (tokens === null) {
    return { error: new PluginError(`Invalid URL: ${req.url}`) }
  }

  const combination = combinations.find(({ id }) => id === tokens[1])

  if (combination === undefined) {
    return { error: new PluginError(`Invalid ID in URL: ${req.url}`) }
  }

  return { serverChannel: combination.serverChannel }
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

// Start listening to requests
const serverListen = async function (server) {
  await promisify(server.listen.bind(server))(HTTP_SERVER_OPTS)
  const { address, port } = server.address()
  const origin = `http://${address}:${port}`
  return origin
}

const HTTP_SERVER_OPTS = { host: 'localhost', port: 0 }

// Each combination gets a different endpoint using its `id`
export const getServerUrl = function (origin, id) {
  return `${origin}/rpc/${id}`
}

const SERVER_URL_REGEXP = /^\/rpc\/([\da-f-]+)$/iu

// Stop the HTTP server
export const stopServer = async function (server) {
  await promisify(server.close.bind(server))()
}
