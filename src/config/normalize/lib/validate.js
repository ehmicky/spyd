import { addPropPrefix } from './prefix.js'

// Consumers can distinguish users errors from system bugs by checking
// the `error.validation` boolean property.
// User errors are distinguished by having error message starting with "must".
// We fail on the first error, as opposed to aggregating all errors
//  - Otherwise, a failed property might be used by another property, which
//    would also appear as failed, even if it has no issues
// We detect this using the error message instead of the error class because:
//  - It is simpler for users
//  - It works both on browsers and in Node.js
//  - It ensures the error message looks good
export const handleValidateError = async function (error, opts) {
  if (isValidateError(error)) {
    setValidationProp(error)
  }

  return await addPropPrefix(error, opts)
}

const isValidateError = function (error) {
  return error instanceof Error && error.message.startsWith('must')
}

// Get a user validation error
export const getValidateError = async function (message, opts) {
  const error = new Error(message)
  setValidationProp(error)
  return await addPropPrefix(error, opts)
}

const setValidationProp = function (error) {
  error.validation = true
}
