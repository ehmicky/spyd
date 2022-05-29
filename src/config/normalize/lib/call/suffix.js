import { inspect } from 'util'

import { wrapError } from '../../../../error/wrap.js'

// Add the current definition as error suffix
export const addCurrentDefinition = function (error, definition) {
  return definition === undefined
    ? error
    : wrapErrorValue(error, 'Current definition', definition)
}

// Add the example definition as error suffix
export const addExampleDefinition = function (error, exampleDefinition) {
  return exampleDefinition === undefined
    ? error
    : wrapErrorValue(error, 'Example definition', exampleDefinition)
}

// Add the current input as error suffix
export const addCurrentInput = function (error, input, hasInput) {
  return hasInput ? wrapErrorValue(error, 'Current input', input) : error
}

// Add the example input as error suffix
export const addExampleInput = function ({ error, example, hasInput, test }) {
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
