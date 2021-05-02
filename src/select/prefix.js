import { UserError } from '../error/main.js'

// Validation error of `select`, `limit` properties
export const throwValidationError = function (message, rawSelectors, propName) {
  const rawSelectorsStr = serializeRawSelectors(rawSelectors)
  throw new UserError(`The "${propName}" configuration property is invalid: ${rawSelectorsStr}
${message}`)
}

const serializeRawSelectors = function (rawSelectors) {
  if (rawSelectors.length === 0) {
    return '[]'
  }

  if (rawSelectors.length === 1) {
    return quoteRawSelector(rawSelectors[0])
  }

  return rawSelectors.map(quoteRawSelector).join(' or ')
}

const quoteRawSelector = function (rawSelector) {
  return `"${rawSelector}"`
}
