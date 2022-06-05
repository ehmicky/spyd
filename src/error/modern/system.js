import errorType from 'error-type'

// Create the SystemError type used for unknown error types.
// We purposely do not export this type nor expose it except through
// `error.name` because:
//  - Users do not need it throw system errors since any uncaught error will be
//    converted to it
//  - This ensures instantiating a system error never throws
//  - This makes the API simpler, stricter and more consistent
export const createSystemError = function (errorNames) {
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
