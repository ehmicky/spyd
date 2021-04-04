import { promisify } from 'util'

import { throwOnStreamError } from '../error/combination.js'
import { PluginError } from '../error/main.js'

import { receiveReturnValue } from './receive.js'

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
export const sendAndReceive = async function (combination, server, params) {
  const receiveReturnPromise = receiveReturnValue(combination, server)

  try {
    await sendParams(combination, params)
    return await receiveReturnPromise
  } catch (error) {
    receiveReturnPromise.catch(noop)
    throw error
  }
}

export const sendParams = async function ({ res }, params) {
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

// eslint-disable-next-line no-empty-function
const noop = function () {}
