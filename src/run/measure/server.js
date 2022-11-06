import { createServer } from 'node:http'
import { promisify } from 'node:util'

import { TARGET_SAMPLE_DURATION } from './loop.js'

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
export const startServer = async function () {
  const server = createServer()
  // eslint-disable-next-line fp/no-mutation
  server.keepAliveTimeout = KEEP_ALIVE_TIMEOUT

  await promisify(server.listen.bind(server))(HTTP_SERVER_OPTS)
  const { address, port } = server.address()
  const serverUrl = `http://${address}:${port}`
  return { server, serverUrl }
}

// Try to re-use the TCP socket between samples.
// Based on the target sample duration. Multiplied by a factor because:
//  - The target sample duration only includes measuring not the duration spent
//    in the runner inner logic nor doing IPC.
//  - Samples might last longer if the task is slow
const KEEP_ALIVE_FACTOR = 1e2
const NANOSECS_TO_MILLISECS = 1e6
const KEEP_ALIVE_TIMEOUT =
  (TARGET_SAMPLE_DURATION / NANOSECS_TO_MILLISECS) * KEEP_ALIVE_FACTOR

const HTTP_SERVER_OPTS = { host: 'localhost', port: 0 }

// End the HTTP server
export const endServer = async function (server) {
  await promisify(server.close.bind(server))()
}
