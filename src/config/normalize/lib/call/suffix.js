import { inspect } from 'util'

// Add the current definition as error suffix
export const addCurrentDefinition = function (error, definition) {
  return definition === undefined
    ? error
    : addSuffix(error, 'Current definition', definition)
}

// Add the example definition as error suffix
export const addExampleDefinition = function (error, exampleDefinition) {
  return exampleDefinition === undefined
    ? error
    : addSuffix(error, 'Example definition', exampleDefinition)
}

// Add the current input as error suffix
export const addCurrentInput = function (error, input, hasInput) {
  return hasInput ? addSuffix(error, 'Current input', input) : error
}

// Add the example input as error suffix
export const addExampleInput = function ({ error, example, hasInput, test }) {
  return example !== undefined && (hasInput || test !== undefined)
    ? addSuffix(error, 'Example input', example)
    : error
}

const addSuffix = function (error, name, value) {
  return new Error(`${name}:${serializeValue(value)}`, { cause: error })
}

const serializeValue = function (value) {
  const valueStr = inspect(value)
  const separator = valueStr.includes('\n') ? '\n' : ' '
  return `${separator}${valueStr}`
}
