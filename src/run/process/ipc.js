import { once } from 'node:events'
import { promisify } from 'node:util'

import getStream from 'get-stream'

import { PluginError } from '../../error/main.js'

import { throwOnStreamError } from './error.js'
import { throwOnTaskError } from './task_error.js'

// Send the next sample's payload by responding to the HTTP long poll request.
// Runners use long polling:
//  - They send their return value with a new HTTP request
//  - The server keeps the request alive until new payload are available, which
//    are then sent as a response
// We use long polling instead of starting a server in the runner because it is
// simpler to implement in runners and has less room for errors, including:
//  - Server parameters
//  - Finding a port and communicating it to parent
//  - Signaling that it is ready to listen to the parent
// There is only one single endpoint for each runner, meant to run a new
// measuring sample:
//  - The server sends some payload to indicate how long to run the sample
//  - The runner sends the return value
// We are setting up return value listening before sending payload to prevent
// any race condition.
export const sendAndReceive = async (payload, server) => {
  const [returnValue] = await Promise.all([
    receiveReturnValue(server),
    sendPayload(payload, server),
  ])
  return returnValue
}

const sendPayload = async (payload, { res }) => {
  try {
    const payloadString = JSON.stringify(payload)
    await Promise.race([
      throwOnStreamError(res),
      promisify(res.end.bind(res))(payloadString),
    ])
  } catch (cause) {
    throw new PluginError('Could not send HTTP response.', { cause })
  }
}

// Receive the sample's return value by receiving a HTTP long poll request.
// This can fail for several reasons:
//  - Wrong HTTP request URL or body due to bug in runner
//  - Error/exception in task
// We directly mutate `server.res` instead of returning it because it makes
// code simpler.
export const receiveReturnValue = async (server) => {
  const [req, res] = await once(server, 'request')
  // eslint-disable-next-line fp/no-mutation, no-param-reassign, require-atomic-updates
  server.res = res

  const returnValue = await parseReturnValue(req)
  throwOnTaskError(returnValue)
  return returnValue
}

// Parse the request's JSON body
const parseReturnValue = async (req) => {
  try {
    const returnValueString = await Promise.race([
      throwOnStreamError(req),
      getStream(req),
    ])
    const returnValue = JSON.parse(returnValueString)
    return returnValue
  } catch (cause) {
    throw new PluginError('Could not receive HTTP request.', { cause })
  }
}
