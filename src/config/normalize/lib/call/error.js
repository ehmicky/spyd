import normalizeException from 'normalize-exception'

import { InputError, DefinitionError, KeywordError } from '../error.js'

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

// Handle errors in `keyword.test|normalize|main()` or in keyword functions.
// We fail on the first error, as opposed to aggregating all errors
//  - Otherwise, a failed property might be used by another property, which
//    would also appear as failed, even if it has no issues
export const handleError = ({ error, errorType, bugType, ...params }) => {
  const errorA = normalizeException(error)
  const isValidation = isValidateError(errorA)
  const type = isValidation ? errorType : bugType
  return ERROR_HANDLERS[type]({ ...params, error: errorA, isValidation })
}

// We distinguish intentional errors from bugs by requiring messages to start
// with "must".
// We detect this using the error message instead of the error class because:
//  - It is simpler for users
//  - It ensures the error message looks good
const isValidateError = (error) => error.message.startsWith('must')

const handleInputError = ({
  error,
  input,
  example,
  prefix,
  originalName,
  hasInput,
  test,
}) => {
  const errorA = addInputPrefix(error, prefix, originalName)
  const errorB = addCurrentInput(errorA, input, hasInput)
  const errorC = addExampleInput({ error: errorB, example, hasInput, test })
  return new InputError('', { cause: errorC })
}

const handleDefinitionError = ({
  error,
  prefix,
  originalName,
  keyword,
  definition,
  exampleDefinition,
  isValidation,
}) => {
  const errorA = addDefinitionPrefix({
    error,
    prefix,
    originalName,
    keyword,
    isValidation,
  })
  const errorB = addCurrentDefinition(errorA, definition)
  const errorC = addExampleDefinition(errorB, exampleDefinition)
  return new DefinitionError('', { cause: errorC })
}

const handleKeywordError = ({
  error,
  input,
  prefix,
  originalName,
  hasInput,
  keyword,
  definition,
}) => {
  const errorA = addKeywordPrefix({ error, prefix, originalName, keyword })
  const errorB = addCurrentDefinition(errorA, definition)
  const errorC = addCurrentInput(errorB, input, hasInput)
  return new KeywordError('', { cause: errorC })
}

const ERROR_HANDLERS = {
  input: handleInputError,
  definition: handleDefinitionError,
  keyword: handleKeywordError,
}
