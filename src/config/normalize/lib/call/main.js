/* eslint-disable max-lines */
// TODO: fix max-lines linting
import { inspect } from 'util'

import { wrapError } from '../../../../error/wrap.js'

// Call `keyword.test()`
export const callTest = async function ({ test, input, info, keyword }) {
  return await callFunc({
    func: test,
    input,
    info,
    hasInput: true,
    keyword,
    errorType: 'keyword',
    bugType: 'keyword',
  })
}

// Call `keyword.normalize()`
export const callNormalize = async function ({
  normalize,
  definition,
  info,
  keyword,
  exampleDefinition,
}) {
  const func = () => normalize(definition)
  return await callFunc({
    func,
    info,
    keyword,
    definition,
    exampleDefinition,
    hasInput: false,
    errorType: 'definition',
    bugType: 'keyword',
  })
}

// Call definition function
export const callDefinition = async function ({
  definition,
  input,
  info,
  hasInput,
  test,
  keyword,
  exampleDefinition,
}) {
  return await callFunc({
    func: definition,
    input,
    info,
    hasInput,
    test,
    keyword,
    exampleDefinition,
    errorType: 'input',
    bugType: 'definition',
  })
}

// Call `keyword.main()`
export const callMain = async function ({
  main,
  definition,
  input,
  info,
  hasInput,
  test,
  keyword,
}) {
  const func = main.bind(undefined, definition)
  return await callFunc({
    func,
    input,
    info,
    hasInput,
    test,
    keyword,
    definition,
    errorType: 'input',
    bugType: 'keyword',
  })
}

// Call a function from `test()`, `main()` or a definition.
// They are all:
//  - Optionally async
//  - Called with same arguments
//  - Error handled
const callFunc = async function ({
  func,
  input,
  info: { originalName },
  info: { example, prefix, ...info },
  hasInput,
  test,
  keyword,
  definition,
  exampleDefinition,
  errorType,
  bugType,
}) {
  try {
    return hasInput ? await func(input, info) : await func(info)
  } catch (error) {
    const isValidation = isValidateError(error)
    const type = isValidation ? errorType : bugType
    throw ERROR_HANDLERS[type]({
      error,
      input,
      example,
      prefix,
      originalName,
      hasInput,
      test,
      keyword,
      definition,
      exampleDefinition,
      isValidation,
    })
  }
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

// The `prefix` is the name of the type of property to show in error
// message and warnings such as "Option".
const addInputPrefix = function (error, prefix, originalName) {
  return wrapError(error, `${prefix} "${originalName}"`)
}

const addDefinitionPrefix = function ({
  error,
  prefix,
  originalName,
  keyword,
  isValidation,
}) {
  const suffix = isValidation ? 'definition' : 'must have a valid definition:\n'
  return wrapError(
    error,
    `${prefix} "${originalName}"'s keyword "${keyword}" ${suffix}`,
  )
}

const addKeywordPrefix = function ({ error, prefix, originalName, keyword }) {
  return wrapError(
    error,
    `${prefix} "${originalName}"'s keyword "${keyword}" bug:`,
  )
}

// Add the current definition as error suffix
const addCurrentDefinition = function (error, definition) {
  return definition === undefined
    ? error
    : wrapErrorValue(error, 'Current definition', definition)
}

// Add the example definition as error suffix
const addExampleDefinition = function (error, exampleDefinition) {
  return exampleDefinition === undefined
    ? error
    : wrapErrorValue(error, 'Example definition', exampleDefinition)
}

// Add the current input as error suffix
const addCurrentInput = function (error, input, hasInput) {
  return hasInput ? wrapErrorValue(error, 'Current input', input) : error
}

// Add the example input as error suffix
const addExampleInput = function ({ error, example, hasInput, test }) {
  return example !== undefined && (hasInput || test !== undefined)
    ? wrapErrorValue(error, 'Example input', example)
    : error
}

const wrapErrorValue = function (error, name, value) {
  return wrapError(error, `\n${name}:${serializeValue(value)}`)
}

const serializeValue = function (value) {
  const valueStr = inspect(value)
  const separator = valueStr.includes('\n') ? '\n' : ' '
  return `${separator}${valueStr}`
}
/* eslint-enable max-lines */
