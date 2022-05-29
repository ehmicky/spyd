import {
  addInputPrefix,
  addDefinitionPrefix,
  addKeywordPrefix,
} from './prefix.js'
import {
  addCurrentDefinition,
  addExampleDefinition,
  addCurrentInput,
  addExampleInput,
} from './suffix.js'

// Handle errors in `keyword.test|normalize|main()` or in keyword functions
export const handleError = function ({ error, errorType, bugType, ...params }) {
  const isValidation = isValidateError(error)
  const type = isValidation ? errorType : bugType
  return ERROR_HANDLERS[type]({ ...params, error, isValidation })
}

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
const isValidateError = function (error) {
  return error instanceof Error && error.message.startsWith('must')
}

const handleInputError = function ({
  error,
  input,
  example,
  prefix,
  originalName,
  hasInput,
  test,
}) {
  error.validation = true
  const errorA = addInputPrefix(error, prefix, originalName)
  const errorB = addCurrentInput(errorA, input, hasInput)
  const errorC = addExampleInput({ error: errorB, example, hasInput, test })
  return errorC
}

const handleDefinitionError = function ({
  error,
  prefix,
  originalName,
  keyword,
  definition,
  exampleDefinition,
  isValidation,
}) {
  const errorA = addDefinitionPrefix({
    error,
    prefix,
    originalName,
    keyword,
    isValidation,
  })
  const errorB = addCurrentDefinition(errorA, definition)
  const errorC = addExampleDefinition(errorB, exampleDefinition)
  return errorC
}

const handleKeywordError = function ({
  error,
  input,
  prefix,
  originalName,
  hasInput,
  keyword,
  definition,
}) {
  const errorA = addKeywordPrefix({ error, prefix, originalName, keyword })
  const errorB = addCurrentDefinition(errorA, definition)
  const errorC = addCurrentInput(errorB, input, hasInput)
  return errorC
}

const ERROR_HANDLERS = {
  input: handleInputError,
  definition: handleDefinitionError,
  keyword: handleKeywordError,
}
