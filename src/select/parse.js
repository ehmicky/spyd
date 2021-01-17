import { getCombinationsIds } from '../combination/ids.js'

import { getPrefix } from './prefix.js'
import { tokenizeSelector } from './tokenize.js'

// Parse `include`, `exclude`, `limit` user-friendly format (array of strings)
// to a code-friendlier format (objects)
// Users specify a list of identifiers, some inverted.
// They do not specify the identifier's category, since we can guess this, in
// order to simplify the syntax.
// However, we do need to group identifiers by category since identifiers of
// the same category use unions while identifiers of different categories use
// intersection.
// This also validates the syntax.
export const parseSelectors = function (rawSelectors, propName, combinations) {
  const selectors = rawSelectors.map((rawSelector) =>
    parseSelector(rawSelector, propName, combinations),
  )
  const inverse = propName === 'exclude'
  return { selectors, inverse }
}

export const parseSelector = function (rawSelector, propName, combinations) {
  const prefix = getPrefix([rawSelector], propName)

  const tokens = tokenizeSelector(rawSelector, prefix)

  const combinationsIds = getCombinationsIds(combinations)
  const tokensA = tokens.map(({ id, inverse }) =>
    addTokenCategory({ id, inverse, combinationsIds }),
  )
  const categories = getSelectorCategories(tokensA)
  const intersect = categories.map((category) => getGroup(tokensA, category))
  return { intersect }
}

// Some `ids` might not be found in combinations. This is because they might:
//  - Have been previously filtered, removing the combinations where those ids
//    were defined
//  - Not be recent, with different/older ids
// Also the `ids` might come from a shared configuration which might not
// perfectly match the current benchmark's ids.
// `ids` with unknown categories are grouped together and will never match.
const addTokenCategory = function ({ id, inverse, combinationsIds }) {
  const idInfoA = combinationsIds.find((idInfo) => idInfo.id === id)
  const category = idInfoA === undefined ? 'unknown' : idInfoA.category
  return { id, inverse, category }
}

const getSelectorCategories = function (tokens) {
  const categories = tokens.map(getCategory)
  return [...new Set(categories)]
}

const getCategory = function ({ category }) {
  return category
}

// Users invert individual identifiers because it simplifies the syntax.
// However, we need to invert whole categories instead. When all identifiers
// of the same category are inverted, we invert the whole category.
// There is no strong reason why a user would want to mix invertion and
// non-invertion for a specific category. However, we silently support it by
// trying to reconcile both.
const getGroup = function (tokens, category) {
  const { normalIds, invertedIds } = getIdGroups(tokens, category)

  if (normalIds.length !== 0) {
    return { ids: normalIds, inverse: false }
  }

  if (invertedIds.length === 0) {
    return { ids: [], inverse: false }
  }

  return { ids: invertedIds, inverse: true }
}

const getIdGroups = function (tokens, category) {
  const tokensA = tokens.filter((token) => token.category === category)
  const normalIds = tokensA.filter((token) => !hasInverse(token)).map(getId)
  const invertedIds = tokensA.filter(hasInverse).map(getId)
  const commonIds = new Set(normalIds.filter((id) => invertedIds.includes(id)))
  const normalIdsA = normalIds.filter((id) => !commonIds.has(id))
  const invertedIdsA = invertedIds.filter((id) => !commonIds.has(id))
  return { normalIds: normalIdsA, invertedIds: invertedIdsA }
}

const hasInverse = function ({ inverse }) {
  return inverse
}

const getId = function ({ id }) {
  return id
}

// Retrieve selector which catches everything
export const getCatchAllSelector = function () {
  return { intersect: [] }
}
