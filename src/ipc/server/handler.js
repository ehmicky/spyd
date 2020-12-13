import { promisify } from 'util'

import getStream from 'get-stream'

import { PluginError } from '../../error/main.js'

import { getInput } from './input.js'
import { handleOutput } from './output.js'
import { setSampleStart, addTimeSpent } from './time_spent.js'
import { findCombinationByUrl } from './url.js'
import { waitForTurn } from './wait.js'

// Handle HTTP requests coming from runners
export const handleRequests = function (combinations, httpServer) {
  httpServer.on('request', handleRequest.bind(undefined, combinations))
}

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
const handleRequest = async function (combinations, req, res) {
  const combination = findCombinationByUrl(req, combinations)
  addTimeSpent({ combination })
  const inputString = await getInputString({ combination, combinations, req })
  await promisify(res.end.bind(res))(inputString)
  setSampleStart(combination)
}

const getInputString = async function ({ combination, combinations, req }) {
  await processOutput(combination, req)
  await waitForTurn(combination, combinations)
  const inputString = processInput(combination)
  return inputString
}

const processOutput = async function (combination, req) {
  const output = await getJsonOutput(req)
  const combinationProps = handleOutput(combination, output)
  // eslint-disable-next-line fp/no-mutating-assign
  Object.assign(combination, combinationProps)
}

const getJsonOutput = async function (req) {
  try {
    const outputString = await getStream(req)
    const output = JSON.parse(outputString)
    return output
  } catch {
    throw new PluginError('Invalid JSON output')
  }
}

const processInput = function (combination) {
  const input = getInput(combination)
  const inputString = JSON.stringify(input)
  return inputString
}
