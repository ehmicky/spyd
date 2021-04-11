import { argv } from 'process'

import got from 'got'

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

// `afterAll` is always called, for cleanup.
// If an error happens in `afterAll`, it is propagated even if another error
// was thrown in `main`. This is because `afterAll` should gracefully handle
// any possible interruption, regardless of what's the current global state.
const measureCombination = async function ({
  start,
  before,
  measure,
  after,
  serverUrl,
  spawnParams,
}) {
  const { tasks, ...startState } = await start(spawnParams)

  await before(startState)

  try {
    await measureSamples({ measure, serverUrl, startState, tasks })
  } finally {
    await after(startState)
  }
}

// Runs a new sample each time the main process asks for it
const measureSamples = async function ({
  measure,
  serverUrl,
  startState,
  tasks,
}) {
  // eslint-disable-next-line fp/no-let
  let returnValue = { tasks }

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

// We use `process.exit()` instead of `process.exitCode` because if some tasks
// have some pending macrotasks, we need to abort them not wait for them.
const successExit = async function (serverUrl) {
  await sendReturnValue({}, serverUrl)
}

// Any error while starting or measuring is most likely a user error, which is
// sent back to the main process.
const errorExit = async function (error, serverUrl) {
  const errorProp = error instanceof Error ? error.stack : String(error)
  await sendReturnValue({ error: errorProp }, serverUrl)
}

// Send a HTTP request to the main process
const sendReturnValue = async function (returnValue, serverUrl) {
  return await got({
    url: serverUrl,
    method: 'POST',
    json: returnValue,
    responseType: 'json',
    resolveBodyOnly: true,
  })
}
