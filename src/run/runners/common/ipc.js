import { argv } from 'process'

import got from 'got'

// TODO
// `after` is always called, for cleanup.
// If an error happens in `after`, it is propagated even if another error
// was thrown in `main`. This is because `after` should gracefully handle
// any possible interruption, regardless of what's the current global state.

// Handles IPC communication with the parent process
export const performRunner = async function (handlers) {
  const state = {}
  // eslint-disable-next-line fp/no-let
  let returnValue = {}

  // eslint-disable-next-line fp/no-loops
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const payload = await sendReturnValue(returnValue)
    // eslint-disable-next-line no-await-in-loop, fp/no-mutation
    returnValue = await handlePayload(payload, handlers, state)
  }
}

// Send HTTP request to parent
const sendReturnValue = async function (returnValue = {}) {
  return await got({
    url: argv[argv.length - 1],
    method: 'POST',
    json: returnValue,
    responseType: 'json',
    resolveBodyOnly: true,
  })
}

// Handle HTTP response from parent.
// Any error while starting or measuring is most likely a user error, which is
// sent back to the main process.
const handlePayload = async function (payload, handlers, state) {
  try {
    return await handlers[payload.event](state, payload)
  } catch (error) {
    return { error: error instanceof Error ? error.stack : String(error) }
  }
}
