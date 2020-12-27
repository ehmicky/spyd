import { argv, exit } from 'process'

import fetch from 'cross-fetch'

// Handles IPC communication with the main process
export const performRunner = async function ({
  start,
  before,
  measure,
  after,
}) {
  const { serverUrl, spawnParams } = parseSpawnParams()

  try {
    await measureCombination({
      start,
      before,
      measure,
      after,
      serverUrl,
      spawnParams,
    })
    await successExit(serverUrl)
  } catch (error) {
    await errorExit(error, serverUrl)
  }
}

// Retrieve the spawnParams sent by the main process
const parseSpawnParams = function () {
  const { serverUrl, ...spawnParams } = JSON.parse(argv[2])
  return { serverUrl, spawnParams }
}

const measureCombination = async function ({
  start,
  before,
  measure,
  after,
  serverUrl,
  spawnParams,
}) {
  const startState = await start(spawnParams)

  try {
    await before(startState)
    await measureSamples({ measure, serverUrl, startState })
  } catch (error) {
    await safeAfter(after, startState)
    throw error
  }

  await after(startState)
}

// Runs a new sample each time the main process asks for it
const measureSamples = async function ({ measure, serverUrl, startState }) {
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
    returnValue = await measure(params, startState)
  }
}

// When `beforeAll`, `beforeEach`, `main` or `afterEach` throws, we still run
// `afterAll` for cleanup. However, `afterAll` might fail if the global state
// is in an odd state due to the interruption. Therefore, we do not propagate
// exceptions from `afterAll` then.
const safeAfter = async function (after, startState) {
  try {
    await after(startState)
  } catch {}
}

// We use `process.exit()` instead of `process.exitCode` because if some tasks
// have some pending macrotasks, we need to abort them not wait for them.
const successExit = async function (serverUrl) {
  await sendReturnValue({}, serverUrl)
  exit(0)
}

// Any error while starting or measuring is most likely a user error, which is
// sent back to the main process.
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
