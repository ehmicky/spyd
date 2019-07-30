import { promisify } from 'util'

import pEvent from 'p-event'

// Receive an IPC message from a parent|child process
const getMessage = async function(processObject, eventName) {
  const [, payload] = await pEvent(
    processObject,
    'message',
    ([eventNameA]) => eventNameA === eventName,
  )
  return payload
}

// Send an IPC message to a parent|child process
const sendMessage = async function(processObject, eventName, payload) {
  await promisify(processObject.send.bind(processObject))([eventName, payload])
}

// From parent to child
export const getChildMessage = getMessage
export const sendChildMessage = sendMessage

// From child to parent
export const getParentMessage = function(eventName) {
  // eslint-disable-next-line no-restricted-globals, node/prefer-global/process
  return getMessage(process, eventName)
}

export const sendParentMessage = function(eventName, payload) {
  // eslint-disable-next-line no-restricted-globals, node/prefer-global/process
  return sendMessage(process, eventName, payload)
}
