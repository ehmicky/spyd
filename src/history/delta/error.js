import { findFormat } from './formats/main.js'

// Enhances delta error messages
export const getDeltaError = function ({ type, delta, name }) {
  const typeMessage = getDeltaTypeMessage(type)
  return `Configuration property "${name}" with value "${delta}" (${typeMessage})`
}

export const getDeltaTypeMessage = function (type) {
  const { message } = findFormat(type)
  return message
}
