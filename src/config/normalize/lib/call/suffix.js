import { inspect } from 'node:util'

import { BaseError } from '../error.js'

// Add the current definition as error suffix
export const addCurrentDefinition = (error, definition) =>
  definition === undefined
    ? error
    : addSuffix(error, 'Current definition', definition)

// Add the example definition as error suffix
export const addExampleDefinition = (error, exampleDefinition) =>
  exampleDefinition === undefined
    ? error
    : addSuffix(error, 'Example definition', exampleDefinition)

// Add the current input as error suffix
export const addCurrentInput = (error, input, hasInput) =>
  hasInput ? addSuffix(error, 'Current input', input) : error

// Add the example input as error suffix
export const addExampleInput = ({ error, example, hasInput, test }) =>
  example !== undefined && (hasInput || test !== undefined)
    ? addSuffix(error, 'Example input', example)
    : error

const addSuffix = (error, name, value) =>
  new BaseError(`${name}:${serializeValue(value)}`, { cause: error })

const serializeValue = (value) => {
  const valueStr = inspect(value)
  const separator = valueStr.includes('\n') ? '\n' : ' '
  return `${separator}${valueStr}`
}
