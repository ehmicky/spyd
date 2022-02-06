import { normalizeError } from '../../../error/main.js'
import { wrapError } from '../../../error/wrap.js'
import { maybeFunction } from '../../../utils/function.js'

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

// Throw a user validation error
export const throwValidateError = async function (message, opts) {
  const error = new Error(message)
  setValidationProp(error)
  throw await addPropPrefix(error, opts)
}

const setValidationProp = function (error) {
  error.validation = true
}

const addPropPrefix = async function (error, opts) {
  const propName = await getPropName(opts)
  return wrapError(error, propName)
}

export const DEFAULT_PREFIX = 'Configuration property'

const getPropName = async function (opts) {
  const prefix = await callPrefix(opts)
  const space =
    prefix === '' || prefix.endsWith(' ') || prefix.endsWith('.') ? '' : ' '
  return `${prefix}${space}${opts.name} `
}

const callPrefix = async function ({ prefix, ...opts }) {
  try {
    const prefixA = await maybeFunction(prefix, opts)
    return String(prefixA)
  } catch (error) {
    const { message } = normalizeError(error)
    return `${message}\n`
  }
}
