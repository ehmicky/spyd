import { argv, exit } from 'process'

import fetch from 'cross-fetch'

// Handles IPC communication with the main process
export const startRunner = async function ({ load, measure }) {
  const { serverUrl, loadParams } = parseLoadParams()

  try {
    const loadState = await load(loadParams)
    await measureSamples({ measure, serverUrl, loadState })
    await successExit(serverUrl)
  } catch (error) {
    await errorExit(error, serverUrl)
  }
}

// Retrieve the load params sent by the main process
const parseLoadParams = function () {
  const { serverUrl, ...loadParams } = JSON.parse(argv[2])
  return { serverUrl, loadParams }
}

// Load the task then runs a new sample each time the main process asks for it
const measureSamples = async function ({ measure, serverUrl, loadState }) {
  // eslint-disable-next-line fp/no-let
  let returnValue = {}

  // eslint-disable-next-line fp/no-loops
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const params = await sendReturnValue(returnValue, serverUrl)

    // eslint-disable-next-line max-depth
    if (params.maxLoops === undefined) {
      break
    }

    // eslint-disable-next-line no-await-in-loop, fp/no-mutation
    returnValue = await measure(params, loadState)
  }
}

// We use `process.exit()` instead of `process.exitCode` because if some tasks
// have some pending macrotasks, we need to abort them not wait for them.
const successExit = async function (serverUrl) {
  await sendReturnValue({}, serverUrl)
  exit(0)
}

// Any error during task loading or measuring is most likely a user error,
// which is sent back to the main process.
const errorExit = async function (error, serverUrl) {
  const errorProp = error instanceof Error ? error.stack : String(error)

  try {
    await sendReturnValue({ error: errorProp }, serverUrl)
  } finally {
    exit(1)
  }
}

// Send a HTTP request to the main process
const sendReturnValue = async function (returnValue, serverUrl) {
  const returnValueString = JSON.stringify(returnValue)
  const response = await fetch(serverUrl, {
    method: 'POST',
    body: returnValueString,
  })
  const params = await response.json()
  return params
}
