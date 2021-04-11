import { argv } from 'process'

import got from 'got'

// Handles IPC communication with the main process
export const performRunner = async function ({
  start,
  before,
  measure,
  after,
}) {
  try {
    await measureCombination({ start, before, measure, after })
    await sendReturnValue({})
  } catch (error) {
    await errorExit(error)
  }
}

// `afterAll` is always called, for cleanup.
// If an error happens in `afterAll`, it is propagated even if another error
// was thrown in `main`. This is because `afterAll` should gracefully handle
// any possible interruption, regardless of what's the current global state.
const measureCombination = async function ({ start, before, measure, after }) {
  const startParams = await sendReturnValue({})
  const { tasks, ...startState } = await start(startParams)

  await before(startState)

  try {
    await measureSamples(measure, startState, tasks)
  } finally {
    await after(startState)
  }
}

// Runs a new sample each time the main process asks for it
const measureSamples = async function (measure, startState, tasks) {
  // eslint-disable-next-line fp/no-let
  let returnValue = { tasks }

  // eslint-disable-next-line fp/no-loops
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const params = await sendReturnValue(returnValue)

    // eslint-disable-next-line max-depth
    if (params.maxLoops === undefined) {
      break
    }

    // eslint-disable-next-line no-await-in-loop, fp/no-mutation
    returnValue = await measure(params, startState)
  }
}

// Any error while starting or measuring is most likely a user error, which is
// sent back to the main process.
const errorExit = async function (error) {
  const errorString = error instanceof Error ? error.stack : String(error)
  await sendReturnValue({ error: errorString })
}

// Send a HTTP request to the main process
const sendReturnValue = async function (returnValue) {
  return await got({
    url: argv[2],
    method: 'POST',
    json: returnValue,
    responseType: 'json',
    resolveBodyOnly: true,
  })
}
