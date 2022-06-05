// eslint-disable-next-line n/file-extension-in-import, import/no-unassigned-import
import 'error-cause/auto'
import errorType from 'error-type'

import { onError } from './handler.js'
import { getOpts } from './opts.js'
import { createSystemError } from './system.js'

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

const getErrorTypes = function (errorNames, onCreate) {
  return Object.fromEntries(
    errorNames.map((errorName) => [errorName, errorType(errorName, onCreate)]),
  )
}
