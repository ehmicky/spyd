// eslint-disable-next-line fp/no-events
import { once } from 'events'
import { promisify } from 'util'

import getStream from 'get-stream'

import { PluginError, UserError } from '../../error/main.js'
import { wrapError } from '../../error/wrap.js'

import { throwOnStreamError } from './error.js'

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
export const sendAndReceive = async function (payload, server) {
  const [returnValue] = await Promise.all([
    receiveReturnValue(server),
    sendPayload(payload, server),
  ])
  return returnValue
}

const sendPayload = async function (payload, { res }) {
  try {
    const payloadString = JSON.stringify(payload)
    await Promise.race([
      throwOnStreamError(res),
      promisify(res.end.bind(res))(payloadString),
    ])
  } catch (error) {
    throw wrapError(error, 'Could not send HTTP response:', PluginError)
  }
}

// Receive the sample's return value by receiving a HTTP long poll request.
// This can fail for several reasons:
//  - Wrong HTTP request URL or body due to bug in runner
//  - Error/exception in task
// We directly mutate `server.res` instead of returning it because it makes
// code simpler.
export const receiveReturnValue = async function (server) {
  const [req, res] = await once(server, 'request')
  // eslint-disable-next-line fp/no-mutation, no-param-reassign, require-atomic-updates
  server.res = res

  const returnValue = await parseReturnValue(req)
  throwIfTaskError(returnValue)
  return returnValue
}

// Parse the request's JSON body
const parseReturnValue = async function (req) {
  try {
    const returnValueString = await Promise.race([
      throwOnStreamError(req),
      getStream(req),
    ])
    const returnValue = JSON.parse(returnValueString)
    return returnValue
  } catch (error) {
    throw wrapError(error, 'Could not receive HTTP request:', PluginError)
  }
}

// When a task throws during any stage, we propagate the error and fail the
// benchmark. Tasks that throw are unstable and might yield invalid benchmarks,
// so we fail hard.
const throwIfTaskError = function ({ error }) {
  if (error === undefined) {
    return
  }

  throw new UserError(error)
}
