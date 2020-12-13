import { argv, exit } from 'process'

import fetch from 'cross-fetch'

// Handles IPC communication with the main process
export const startRunner = async function ({ load, bench }) {
  const { serverUrl, loadParams } = parseLoadParams()

  try {
    await measureSamples({ load, bench, serverUrl, loadParams })
  } catch (error) {
    await handleError(error, serverUrl)
  }
}

// Retrieve the load params sent by the main process
const parseLoadParams = function () {
  const { serverUrl, ...loadParams } = JSON.parse(argv[2])
  return { serverUrl, loadParams }
}

// Load the task then runs a new sample each time the main process asks for it
const measureSamples = async function ({ load, bench, serverUrl, loadParams }) {
  // eslint-disable-next-line fp/no-let
  let returnValue = load(loadParams)

  // eslint-disable-next-line fp/no-loops
  do {
    // eslint-disable-next-line no-await-in-loop
    const params = await sendReturnValue(returnValue, serverUrl)
    // eslint-disable-next-line fp/no-mutation
    returnValue = bench(params)
  } while (true)
}

// Any error during task loading or measuring is most likely a user error,
// which is sent back to the main process.
const handleError = async function (error, serverUrl) {
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
