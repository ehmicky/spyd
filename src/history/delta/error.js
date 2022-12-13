import { findFormat } from './formats/main.js'

// Enhances delta error messages
export const getDeltaError = ({ type, original }, name) => {
  const typeMessage = getDeltaTypeMessage(type)
  return `Configuration property "${name}" with value "${original}" (${typeMessage})`
}

export const getDeltaTypeMessage = (type) => {
  const { message } = findFormat(type)
  return message
}
