import { argv } from 'node:process'

import { got } from 'got'

import { BaseError, IpcSerializationError, UnknownError } from './error.js'

// Handles IPC communication with the parent process
export const handleEvents = async (handlers) => {
  const state = {}
  // eslint-disable-next-line fp/no-let
  let body = JSON.stringify({})

  // eslint-disable-next-line fp/no-loops
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const payload = await sendReturnValue(body)
    // eslint-disable-next-line no-await-in-loop, fp/no-mutation
    body = await handlePayload(payload, handlers, state)
  }
}

// Send HTTP request to parent
const sendReturnValue = async (body) =>
  await got({
    url: argv.at(-1),
    method: 'POST',
    body,
    responseType: 'json',
    resolveBodyOnly: true,
  })

// Handle HTTP response from parent.
// Any error while starting or measuring is most likely a user error, which is
// sent back to the main process.
const handlePayload = async (payload, handlers, state) => {
  try {
    const returnValue = await handlers[payload.event](state, payload)
    return safeSerializeBody(returnValue)
  } catch (error) {
    return serializeBody(getErrorPayload(error))
  }
}

// Retrieve payload to send to parent on errors
const getErrorPayload = (error) => {
  const errorA = BaseError.normalize(error, UnknownError)
  return { error: errorA }
}

// Serialize payload but also handle invalid JSON errors
const safeSerializeBody = (returnValue = {}) => {
  try {
    return serializeBody(returnValue)
  } catch (cause) {
    throw new IpcSerializationError('', { cause })
  }
}

const serializeBody = (returnValue) => JSON.stringify(returnValue)
