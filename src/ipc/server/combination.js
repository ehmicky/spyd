import { promisify } from 'util'

import getStream from 'get-stream'

import { PluginError, UserError } from '../../error/main.js'

import { getSampleStart, addSampleDuration } from './duration.js'
import { getInput } from './input.js'
import { waitForStart, waitForOutput } from './orchestrator.js'
import { handleOutput } from './output.js'

const pSetTimeout = promisify(setTimeout)

// Runners use long polling:
//  - They send their output with a new HTTP request
//  - The server keeps the request alive until a new input is available, which
//    is then sent as a response
// We use long polling instead of real bidirectional procotols because it is
// simpler to implement in runners.
// There is only one single endpoint for each runner, meant to run a new
// measuring sample:
//   - The server sends some input to indicate how long to run the sample
//   - The runner sends the results back as output
export const measureCombination = async function ({
  combination: { orchestrator, ...combination },
  duration,
}) {
  // eslint-disable-next-line fp/no-let
  let res = await processOutput(combination, orchestrator)

  // TODO: stop loop on end of `duration * combinations.length`
  // eslint-disable-next-line fp/no-loops
  while (true) {
    // eslint-disable-next-line no-await-in-loop, fp/no-mutation
    res = await measureSample({ combination, orchestrator, res, duration })
  }
}

const measureSample = async function ({
  combination,
  orchestrator,
  res,
  duration,
}) {
  await waitForStart(orchestrator)

  const sampleStart = getSampleStart()

  const [newRes] = await Promise.race([
    processCombination({ combination, orchestrator, res }),
    waitForSampleTimeout(duration, combination),
  ])

  addSampleDuration(combination, sampleStart)
  return newRes
}

// We are listening for output before sending input to prevent race condition
const processCombination = async function ({ combination, orchestrator, res }) {
  return await Promise.all([
    processOutput(combination, orchestrator),
    processInput(combination, res),
  ])
}

const processInput = async function (combination, res) {
  const input = getInput(combination)
  const inputString = JSON.stringify(input)
  await promisify(res.end.bind(res))(inputString)
}

const processOutput = async function (combination, orchestrator) {
  const { req, res: nextRes } = await waitForOutput(orchestrator)
  const output = await getJsonOutput(req)
  const newState = handleOutput(combination, output)
  // eslint-disable-next-line fp/no-mutating-assign
  Object.assign(combination.state, newState)
  return nextRes
}

const waitForSampleTimeout = async function (duration, { taskId }) {
  const sampleTimeout = Math.round(duration / NANOSECS_TO_MILLISECS)
  await pSetTimeout(sampleTimeout)

  // TODO: use error messages from src/processes/error.js
  throw new UserError(`Task "${taskId}" ${TIMEOUT_ERROR}`)
}

const NANOSECS_TO_MILLISECS = 1e6
export const TIMEOUT_ERROR =
  'timed out. Please increase the "duration" configuration property.'

const getJsonOutput = async function (req) {
  try {
    const outputString = await getStream(req)
    const output = JSON.parse(outputString)
    return output
  } catch {
    throw new PluginError('Invalid JSON output')
  }
}
