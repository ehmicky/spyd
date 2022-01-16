import { UserError } from '../error/main.js'

// When selecting combinations with `select`, all combinations might be excluded
// When this happens:
//  - For new results with `run|dev`, we fail since it would not make sense
//  - For history results, we ignore and just report results without any
//    combinations
export const validateSelectMatches = function (combinations, select) {
  if (combinations.length === 0) {
    throwValidationError(
      'No combinations match the selection.',
      select,
      'select',
    )
  }
}

// Validation error of `select` and config selectors
export const throwValidationError = function (message, rawSelectors, name) {
  const rawSelectorsStr = serializeRawSelectors(rawSelectors)
  throw new UserError(`The "${name}" configuration property is invalid: ${rawSelectorsStr}
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
