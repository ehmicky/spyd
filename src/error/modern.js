// eslint-disable-next-line n/file-extension-in-import, import/no-unassigned-import
import 'error-cause/auto'
import errorType from 'error-type'
import mergeErrorCause from 'merge-error-cause'

import { allowErrorTypes } from './types.js'

// Create error types by passing an array of error names.
// Also returns an `onError(error) => error` function to use as a top-level
// error handler.
// Custom error `onCreate()` logic can be specified
//  - To make it type-specific, an object of functions should be used, then
//    `object[error.name]` should be used inside `onCreate()`
// There is no source maps support: instead users can use:
//  - Node.js: `--enable-source-maps` flag
//  - Chrome: `node-source-map-support`
//  - Any browsers: `stacktrace.js`
export const modernErrors = function (errorNames, opts) {
  const { onCreate } = getOpts(opts)
  const ErrorTypes = Object.fromEntries(
    errorNames.map((errorName) => [errorName, errorType(errorName, onCreate)]),
  )
  const onErrorHandler = onError.bind(undefined, Object.values(ErrorTypes))
  return { ...ErrorTypes, onError: onErrorHandler }
}

const getOpts = function ({ onCreate } = {}) {
  return { onCreate }
}

// Error handler that normalizes an error, merge its `error.cause` and ensure
// its type is among an allowed list of types.
const onError = function (ErrorTypes, error) {
  const errorA = mergeErrorCause(error)
  const errorB = allowErrorTypes(errorA, ErrorTypes)
  return errorB
}
