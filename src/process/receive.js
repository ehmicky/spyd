// eslint-disable-next-line fp/no-events
import { once } from 'events'

import getStream from 'get-stream'

import {
  addCombinationError,
  throwOnStreamError,
} from '../error/combination.js'
import { PluginError, UserError } from '../error/main.js'

// Receive the sample's return value by receiving a HTTP long poll request.
// This can fail for several reasons:
//  - Wrong HTTP request URL or body due to bug in runner
//  - Error/exception in task
export const receiveReturnValue = async function (combination) {
  const { req, res } = await waitForReturnValue(combination)
  const newCombination = { ...combination, res }

  const { returnValue, error } = await parseReturnValue(req)
  const newCombinationA = addCombinationError(newCombination, error)
  return { newCombination: newCombinationA, returnValue }
}

const waitForReturnValue = async function ({ serverChannel }) {
  const [{ req, res }] = await once(serverChannel, 'return')
  return { req, res }
}

// Parse the request's JSON body
const parseReturnValue = async function (req) {
  try {
    const returnValueString = await Promise.race([
      throwOnStreamError(req),
      getStream(req),
    ])
    const returnValue = JSON.parse(returnValueString)
    const error = getTaskError(returnValue)
    return { returnValue, error }
  } catch (error) {
    const errorA = new PluginError(
      `Could not receive HTTP request: ${error.stack}`,
    )
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
