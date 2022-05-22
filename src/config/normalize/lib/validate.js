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
export const handleValidateError = function (error) {
  if (isValidateError(error)) {
    error.validation = true
  }
}

const isValidateError = function (error) {
  return error instanceof Error && error.message.startsWith('must')
}
