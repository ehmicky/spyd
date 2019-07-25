import { promisify } from 'util'

import pEvent from 'p-event'

const getMessage = async function(processObject, eventName) {
  const [, payload] = await pEvent(
    processObject,
    'message',
    ([eventNameA]) => eventNameA === eventName,
  )
  return payload
}

const sendMessage = async function(proc, eventName, payload) {
  await promisify(proc.send.bind(proc))([eventName, payload])
}

export const getChildMessage = getMessage
export const sendChildMessage = sendMessage

export const getParentMessage = function(eventName) {
  // eslint-disable-next-line no-restricted-globals, node/prefer-global/process
  return getMessage(process, eventName)
}

export const sendParentMessage = function(eventName, payload) {
  // eslint-disable-next-line no-restricted-globals, node/prefer-global/process
  return sendMessage(process, eventName, payload)
}
