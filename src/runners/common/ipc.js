import { argv } from 'process'

import got from 'got'

import { wrapError } from '../../error/wrap.js'

import { serializeError, IpcSerializationError } from './error.js'

// Handles IPC communication with the parent process
export const handleEvents = async function (handlers) {
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
const sendReturnValue = async function (body) {
  return await got({
    url: argv[argv.length - 1],
    method: 'POST',
    body,
    responseType: 'json',
    resolveBodyOnly: true,
  })
}

// Handle HTTP response from parent.
// Any error while starting or measuring is most likely a user error, which is
// sent back to the main process.
const handlePayload = async function (payload, handlers, state) {
  try {
    const returnValue = await handlers[payload.event](state, payload)
    return safeSerializeBody(returnValue)
  } catch (error) {
    return serializeBody({ error: serializeError(error) })
  }
}

// Serialize payload but also handle invalid JSON errors
const safeSerializeBody = function (returnValue = {}) {
  try {
    return serializeBody(returnValue)
  } catch (error) {
    throw wrapError(error, '', IpcSerializationError)
  }
}

const serializeBody = function (returnValue) {
  return JSON.stringify(returnValue)
}
