// eslint-disable-next-line fp/no-events
import { once } from 'events'
import { promisify } from 'util'

import getStream from 'get-stream'

import { PluginError, UserError } from '../error/main.js'

import { getSampleStart, addSampleDuration } from './duration.js'
import { getNextCombination } from './next.js'
import { getParams } from './params.js'
import { handleReturnValue } from './return.js'

// Measure all combinations, until there is no `duration` left.
// We ensure combinations are never measured at the same time:
//  - otherwise they would slow down each other and have higher variance
//  - multi-core CPUs are designed to execute in parallel but in practice they
//    do impact the performance of each other
//  - this does mean we are under-utilizing CPUs
// We also break down each combination into samples, i.e. small units of
// duration when measures are taken:
//  - This allows combinations to be live reported at the same time, displaying
//    them competing with each other
//  - This allows some parameters to be callibrated (e.g. `repeat`)
//  - This helps during manual interruptions (CTRL-C) by allowing samples to
//    end so tasks can be cleaned up
//  - This provides with fast fail if one of the combinations fails
export const measureCombinations = async function (combinations, benchmarkEnd) {
  const combinationsA = await Promise.all(combinations.map(waitForLoad))
  const combinationsB = await measureSamples(combinationsA, benchmarkEnd)
  return combinationsB
}

const waitForLoad = async function (combination) {
  return await receiveReturnValue(combination, {})
}

const measureSamples = async function (combinations, benchmarkEnd) {
  // eslint-disable-next-line fp/no-loops
  while (true) {
    const combination = getNextCombination(combinations, benchmarkEnd)

    // eslint-disable-next-line max-depth
    if (combination === undefined) {
      break
    }

    // eslint-disable-next-line no-await-in-loop
    const newCombination = await addSample(combination)
    // eslint-disable-next-line fp/no-mutation, no-param-reassign
    combinations = updateCombinations(combinations, newCombination, combination)
  }

  return combinations
}

const addSample = async function (combination) {
  const sampleStart = getSampleStart()

  const newCombination = await handleCombination(combination)

  addSampleDuration(newCombination, sampleStart)
  return newCombination
}

// We are setting up return value listening before sending params to prevent any
// race condition
const handleCombination = async function ({ res, ...combination }) {
  const params = getParams(combination)
  const [newCombination] = await Promise.all([
    receiveReturnValue(combination, params),
    sendParams(params, res),
  ])
  return newCombination
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
const receiveReturnValue = async function (combination, params) {
  const [{ req, res }] = await once(combination.serverChannel, 'return')
  const returnValue = await getJsonReturn(req)
  handleTaskError(returnValue)
  const state = handleReturnValue(combination, returnValue, params)
  return { ...combination, res, state: { ...combination.state, ...state } }
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

const updateCombinations = function (
  combinations,
  newCombination,
  oldCombination,
) {
  return combinations.map((combination) =>
    updateCombination(combination, newCombination, oldCombination),
  )
}

const updateCombination = function (
  combination,
  newCombination,
  oldCombination,
) {
  return combination === oldCombination ? newCombination : combination
}
