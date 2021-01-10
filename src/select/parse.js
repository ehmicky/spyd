// Parse `include` and `exclude` user-friendly format (array of strings) to a
// code-friendlier format (objects)
export const parseAllSelectors = function (include, exclude) {
  return [
    parseSelectors(include, 'include'),
    parseSelectors(exclude, 'exclude'),
  ]
}

const parseSelectors = function (selectors, propName) {
  const selectorsA = selectors.flatMap(parseSelector)
  const original = getOriginal(selectors)
  return { selectors: selectorsA, original, propName }
}

const parseSelector = function (selector) {
  const intersect = selector.trim().split(GROUP_DELIMITER_REGEX).map(parseGroup)
  return { intersect }
}

const GROUP_DELIMITER_REGEX = /\s+/gu

const parseGroup = function (group) {
  const { group: groupA, inverse } = parseInverse(group)
  const ids = groupA.split(ID_DELIMITER)
  return { ids, inverse }
}

const parseInverse = function (group) {
  const inverse = group.startsWith(INVERSE_SYMBOL)
  const groupA = inverse ? group.slice(1) : group
  return { group: groupA, inverse }
}

const INVERSE_SYMBOL = '!'
const ID_DELIMITER = ','

// Serialize `include` and `exclude` properties to include in error messages
const getOriginal = function (selectors) {
  if (selectors.length === 0) {
    return ''
  }

  if (selectors.length === 1) {
    return quoteSelector(selectors[0])
  }

  return selectors.map(quoteSelector).join(' or ')
}

const quoteSelector = function (selector) {
  return `"${selector}"`
}
