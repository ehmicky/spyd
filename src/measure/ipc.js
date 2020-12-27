// eslint-disable-next-line fp/no-events
import { once } from 'events'
import { promisify } from 'util'

import getStream from 'get-stream'

import { PluginError, UserError } from '../error/main.js'

import { addCombinationError, combinationHasErrored } from './error.js'

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
export const sendAndReceive = async function (combination, params) {
  const receiveReturnPromise = receiveReturnValue(combination)
  const newCombination = await sendParams(combination, params)

  if (combinationHasErrored(newCombination)) {
    receiveReturnPromise.catch(noop)
    return { newCombination }
  }

  return await receiveReturnPromise
}

export const sendParams = async function (combination, params) {
  try {
    await sendResponse(combination, params)
    return combination
  } catch (error) {
    const errorA = new PluginError(
      `Could not send HTTP response: ${error.stack}`,
    )
    return addCombinationError(combination, errorA)
  }
}

// We use `once(res, 'dummy_event')` to make any `error` event throw
const sendResponse = async function ({ res }, params) {
  const paramsString = JSON.stringify(params)
  await Promise.race([
    once(res, 'dummy_event'),
    promisify(res.end.bind(res))(paramsString),
  ])
}

// Receive the sample's return value by receiving a HTTP long poll request.
// This can fail for several reasons:
//  - Wrong HTTP request URL or body due to bug in runner
//  - Error/exception in task
export const receiveReturnValue = async function (combination) {
  const { req, res, error } = await waitForReturnValue(combination)
  const newCombination = { ...combination, res }
  const newCombinationA = addCombinationError(newCombination, error)

  if (combinationHasErrored(newCombinationA)) {
    return { newCombination: newCombinationA }
  }

  const { returnValue, error: errorA } = await parseReturnValue(req)
  const newCombinationB = addCombinationError(newCombinationA, errorA)
  return { newCombination: newCombinationB, returnValue }
}

const waitForReturnValue = async function ({ serverChannel }) {
  const [{ req, res, error }] = await once(serverChannel, 'return')
  return { req, res, error }
}

// Parse the request's JSON body
const parseReturnValue = async function (req) {
  try {
    const returnValueString = await getStream(req)
    const returnValue = JSON.parse(returnValueString)
    const error = getTaskError(returnValue)
    return { returnValue, error }
  } catch (error) {
    const errorA = new PluginError(`Invalid JSON return value: ${error.stack}`)
    return { error: errorA }
  }
}

// When a task throws during any stage, we propagate the error and fail the
// benchmark. Tasks that throw are unstable and might yield invalid benchmarks,
// so we fail hard.
const getTaskError = function ({ error }) {
  if (error === undefined) {
    return
  }

  return new UserError(error)
}

// eslint-disable-next-line no-empty-function
const noop = function () {}
