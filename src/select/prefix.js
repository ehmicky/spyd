// Serialize `include` and `exclude` properties to include in error messages
export const getPrefix = function (selectors, propName) {
  const original = getOriginal(selectors)
  return `The "${propName}" configuration property is invalid:
  ${original}
`
}

const getOriginal = function (selectors) {
  if (selectors.length === 0) {
    return '[]'
  }

  if (selectors.length === 1) {
    return quoteSelector(selectors[0])
  }

  return selectors.map(quoteSelector).join(' or ')
}

const quoteSelector = function (selector) {
  return `"${selector}"`
}
