// Serialize `include`, `exclude`, `limit` properties to include in
// error messages
export const getPrefix = function (rawSelectors, propName) {
  const original = getOriginal(rawSelectors)
  return `The "${propName}" configuration property is invalid: ${original}\n`
}

const getOriginal = function (rawSelectors) {
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
