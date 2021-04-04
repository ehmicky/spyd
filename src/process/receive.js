// eslint-disable-next-line fp/no-events
import { once } from 'events'

import getStream from 'get-stream'

import { throwOnStreamError } from '../error/combination.js'
import { PluginError, UserError } from '../error/main.js'

// Receive the sample's return value by receiving a HTTP long poll request.
// This can fail for several reasons:
//  - Wrong HTTP request URL or body due to bug in runner
//  - Error/exception in task
export const receiveReturnValue = async function (combination, server) {
  const [req, res] = await once(server, 'request')
  const newCombination = { ...combination, res }

  const returnValue = await parseReturnValue(req)
  throwIfTaskError(returnValue)
  return { newCombination, returnValue }
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
