import { findFormat } from './formats/main.js'

// Enhances delta error messages
export const addDeltaError = function (error, { type, delta, name }) {
  const deltaError = getDeltaError({ type, delta, name })
  error.message = `${deltaError} ${error.message}.`
  return error
}

export const getDeltaError = function ({ type, delta, name }) {
  const { message } = findFormat(type)
  const deltaProp = getDeltaProp(delta, name)
  return `${deltaProp} (${message})`
}

export const getDeltaProp = function (delta, name) {
  return `"${name}" configuration property "${delta}"`
}
