// eslint-disable-next-line fp/no-events
import { once } from 'events'
import { promisify } from 'util'

import getStream from 'get-stream'

import { PluginError, UserError } from '../error/main.js'

import { throwOnStreamError } from './error.js'

// Send the next sample's params by responding to the HTTP long poll request.
// Runners use long polling:
//  - They send their return value with a new HTTP request
//  - The server keeps the request alive until new params are available, which
//    are then sent as a response
// We use long polling instead of real bidirectional procotols because it is
// simpler to implement in runners.
// There is only one single endpoint for each runner, meant to run a new
// measuring sample:
//   - The server sends some params to indicate how long to run the sample
//   - The runner sends the return value
// We are setting up return value listening before sending params to prevent any
// race condition.
export const sendAndReceive = async function (params, server, res) {
  const [{ returnValue, res: resA }] = await Promise.all([
    receiveReturnValue(server),
    sendParams(params, res),
  ])
  return { returnValue, res: resA }
}

const sendParams = async function (params, res) {
  try {
    const paramsString = JSON.stringify(params)
    await Promise.race([
      throwOnStreamError(res),
      promisify(res.end.bind(res))(paramsString),
    ])
  } catch (error) {
    throw new PluginError(`Could not send HTTP response: ${error.stack}`)
  }
}

// Receive the sample's return value by receiving a HTTP long poll request.
// This can fail for several reasons:
//  - Wrong HTTP request URL or body due to bug in runner
//  - Error/exception in task
export const receiveReturnValue = async function (server) {
  const [req, res] = await once(server, 'request')

  const returnValue = await parseReturnValue(req)
  throwIfTaskError(returnValue)
  return { returnValue, res }
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
    throw new PluginError(`Could not receive HTTP request: ${error.stack}`)
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
