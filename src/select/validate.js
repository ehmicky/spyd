import { UserError } from '../error/main.js'

// When selecting combinations with `select`, all combinations might be excluded
// When this happens:
//  - For new results with `run|dev`, we fail since it would not make sense
//  - For history results, we ignore and just report empty results
export const validateMatches = function (rawResult, { select }) {
  if (rawResult.combinations.length === 0) {
    throwValidationError(
      'No combinations match the selection.',
      select,
      'select',
    )
  }
}

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
