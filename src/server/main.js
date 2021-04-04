// eslint-disable-next-line fp/no-events
import { EventEmitter } from 'events'
import { createServer } from 'http'
import { promisify } from 'util'

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
export const startServer = async function (combination, duration) {
  const server = createServer()
  const combinationA = handleRequests(server, combination)
  const serverUrl = await serverListen(server, duration)
  return { server, serverUrl, combination: combinationA }
}

// Handle HTTP requests coming from runners.
// Emit a `return` event to communicate it to the proper combination.
// HTTP server requests use events. We need to create an EventEmitter to
// propagate each request to the right combintion.
const handleRequests = function (server, combination) {
  const serverChannel = new EventEmitter()
  const combinationA = { ...combination, serverChannel }
  server.on('request', (req, res) => {
    serverChannel.emit('return', { req, res })
  })
  return combinationA
}

// Start listening to requests
const serverListen = async function (server, duration) {
  setKeepAliveTimeout(server, duration)

  await promisify(server.listen.bind(server))(HTTP_SERVER_OPTS)
  const { address, port } = server.address()
  const serverUrl = `http://${address}:${port}`
  return serverUrl
}

const setKeepAliveTimeout = function (server, duration) {
  if (duration === 1) {
    return
  }

  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  server.keepAliveTimeout = Math.ceil(duration / NANOSECS_TO_MILLISECS)
}

const NANOSECS_TO_MILLISECS = 1e6
const HTTP_SERVER_OPTS = { host: 'localhost', port: 0 }

// End the HTTP server
export const endServer = async function (server) {
  await promisify(server.close.bind(server))()
}
