import { promisify } from 'util'

import getStream from 'get-stream'

import { PluginError, UserError } from '../error/main.js'

import { getSampleStart, addSampleDuration } from './duration.js'
import { waitForStart, waitForReturn } from './orchestrator.js'
import { getParams } from './params.js'
import { handleReturnValue } from './return.js'

const pSetTimeout = promisify(setTimeout)

// Measure a single combination, until there is no `duration` left
export const measureCombination = async function ({
  combination: { orchestrator, ...combination },
  duration,
}) {
  // eslint-disable-next-line fp/no-let
  let res = await receiveReturnValue({ combination, orchestrator, params: {} })

  // eslint-disable-next-line fp/no-loops, no-await-in-loop
  while (await waitForStart(orchestrator)) {
    // eslint-disable-next-line no-await-in-loop, fp/no-mutation
    res = await measureSample({ combination, orchestrator, res, duration })
  }
}

// Each combination is measured in a series of smaller samples
const measureSample = async function ({
  combination,
  orchestrator,
  res,
  duration,
}) {
  const sampleStart = getSampleStart()

  const [newRes] = await Promise.race([
    handleCombination({ combination, orchestrator, res }),
    waitForSampleTimeout(duration),
  ])

  addSampleDuration(combination, sampleStart)
  return newRes
}

// We are setting up return value listening before sending params to prevent any
// race condition
const handleCombination = async function ({ combination, orchestrator, res }) {
  const params = getParams(combination)
  return await Promise.all([
    receiveReturnValue({ combination, orchestrator, params }),
    sendParams(params, res),
  ])
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
  const { req, res: nextRes } = await waitForReturn(orchestrator)
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

// The `duration` configuration property is also used for timeout. This ensures:
//  - samples do not execute forever
//  - the user sets a `duration` higher than the task's duration
// The `exec` action does not use any timeout
// Timeouts are only meant to stop tasks that are longer than the `duration`.
// In that case, measuring is just impossible.
// Failing the benchmark is disruptive and should only be done when there is no
// possible fallback. For example, if a task was executed several times but
// becomes much slower in the middle of the combination (while still being
// slower than the `duration`), we should not fail. Instead, the task
// will just take a little longer. We must just make a best effort to minimize
// the likelihood of this to happen.
const waitForSampleTimeout = async function (duration) {
  const sampleTimeout = Math.round(duration / NANOSECS_TO_MILLISECS)
  await pSetTimeout(sampleTimeout)

  throw new UserError(
    'Task timed out. Please increase the "duration" configuration property.',
  )
}

const NANOSECS_TO_MILLISECS = 1e6
