// eslint-disable-next-line fp/no-events
import { once } from 'events'
import { promisify } from 'util'

import getStream from 'get-stream'

import { PluginError, UserError } from '../error/main.js'

import { getSampleStart, addSampleDuration } from './duration.js'
import { getParams } from './params.js'
import { handleReturnValue } from './return.js'

// Measure a single combination, until there is no `duration` left
export const measureCombination = async function ({
  combination,
  combination: { orchestrator, state },
}) {
  // eslint-disable-next-line fp/no-let
  let res = await receiveReturnValue({ combination, orchestrator, params: {} })
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  state.loaded = true

  // eslint-disable-next-line fp/no-loops, no-await-in-loop
  while (await waitForNewSample(orchestrator)) {
    // eslint-disable-next-line no-await-in-loop, fp/no-mutation
    res = await measureSample({ combination, orchestrator, res })
  }
}

// Make a combination notify its sample has ended, then wait for its next sample
// We must do the latter before the former to prevent any race condition.
const waitForNewSample = async function (orchestrator) {
  const [[shouldExit]] = await Promise.all([
    once(orchestrator, 'sample'),
    orchestrator.emit('end'),
  ])
  return shouldExit
}

// Each combination is measured in a series of smaller samples
const measureSample = async function ({ combination, orchestrator, res }) {
  const sampleStart = getSampleStart()

  const newRes = await handleCombination({ combination, orchestrator, res })

  addSampleDuration(combination, sampleStart)
  return newRes
}

// We are setting up return value listening before sending params to prevent any
// race condition
const handleCombination = async function ({ combination, orchestrator, res }) {
  const params = getParams(combination)
  const [newRes] = await Promise.all([
    receiveReturnValue({ combination, orchestrator, params }),
    sendParams(params, res),
  ])
  return newRes
}

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
const sendParams = async function (params, res) {
  const paramsString = JSON.stringify(params)
  await promisify(res.end.bind(res))(paramsString)
}

// Receive the sample's return value by receiving a HTTP long poll request.
const receiveReturnValue = async function ({
  combination,
  orchestrator,
  params,
}) {
  const [{ req, res: nextRes }] = await once(orchestrator, 'return')
  const returnValue = await getJsonReturn(req)
  handleTaskError(returnValue)
  const newState = handleReturnValue(combination, returnValue, params)
  // eslint-disable-next-line fp/no-mutating-assign
  Object.assign(combination.state, newState)
  return nextRes
}

// Parse the request's JSON body
const getJsonReturn = async function (req) {
  try {
    const returnValueString = await getStream(req)
    const returnValue = JSON.parse(returnValueString)
    return returnValue
  } catch (error) {
    throw new PluginError(`Invalid JSON return value: ${error.stack}`)
  }
}

// When a task throws during load or execution, we propagate the error and fail
// the benchmark. Tasks that throw are unstable and might yield invalid
// benchmarks, so we fail hard.
const handleTaskError = function ({ error }) {
  if (error === undefined) {
    return
  }

  throw new UserError(error)
}
