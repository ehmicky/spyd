// eslint-disable-next-line fp/no-events
import { EventEmitter } from 'events'

// Handle HTTP requests coming from runners.
// Emit a `return` event to communicate it to the proper combination.
// HTTP server requests use events. We need to create an EventEmitter to
// propagate each request to the right combintion.
export const handleRequests = function (server, combination) {
  const serverChannel = new EventEmitter()
  const combinationA = { ...combination, serverChannel }
  server.on('request', (req, res) => {
    serverChannel.emit('return', { req, res })
  })
  return combinationA
}
