// eslint-disable-next-line n/file-extension-in-import, import/no-unassigned-import
import 'error-cause/auto'
import errorType from 'error-type'
import mergeErrorCause from 'merge-error-cause'

import { getOpts } from './opts.js'
import { allowErrorTypes } from './types.js'

// Create error types by passing an array of error names.
// Also returns an `onError(error) => error` function to use as a top-level
// error handler.
// Custom error `onCreate()` logic can be specified
//  - To make it type-specific, an object of functions should be used, then
//    `object[error.name]` should be used inside `onCreate()`
// Consumers should check for `error.name`
//  - As opposed to using `instanceof`
//  - This removes the need to import/export error types
// There is no source maps support: instead users can use:
//  - Node.js: `--enable-source-maps` flag
//  - Chrome: `node-source-map-support`
//  - Any browsers: `stacktrace.js`
export const modernErrors = function (errorNames, opts) {
  const { onCreate } = getOpts(opts)
  const SystemError = createSystemError(errorNames)
  const ErrorTypes = getErrorTypes(errorNames, onCreate)
  const onErrorHandler = onError.bind(
    undefined,
    Object.values(ErrorTypes),
    SystemError,
  )
  return { ...ErrorTypes, onError: onErrorHandler }
}

// Create the SystemError type used for unknown error types.
// We purposely do not export this type nor expose it except through
// `error.name` because:
//  - Users do not need it throw system errors since any uncaught error will be
//    converted to it
//  - This ensures instantiating a system error never throws
//  - This makes the API simpler, stricter and more consistent
const createSystemError = function (errorNames) {
  validateSystemName(errorNames)
  return errorType(SYSTEM_ERROR_NAME)
}

const validateSystemName = function (errorNames) {
  if (errorNames.includes(SYSTEM_ERROR_NAME)) {
    throw new Error(`Error type must not be named "${SYSTEM_ERROR_NAME}".
"${SYSTEM_ERROR_NAME}" is reserved for exceptions matching none of the error types.`)
  }
}

const SYSTEM_ERROR_NAME = 'SystemError'

const getErrorTypes = function (errorNames, onCreate) {
  return Object.fromEntries(
    errorNames.map((errorName) => [errorName, errorType(errorName, onCreate)]),
  )
}

// Error handler that normalizes an error, merge its `error.cause` and ensure
// its type is among an allowed list of types.
const onError = function (ErrorTypes, SystemError, error) {
  const errorA = mergeErrorCause(error)
  const errorB = allowErrorTypes(errorA, ErrorTypes, SystemError)
  return errorB
}
