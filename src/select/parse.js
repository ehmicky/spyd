import { getCombinationsIds } from '../combination/ids.js'

import { tokenizeSelector } from './tokenize.js'

// Parse `select`, `limit` user-friendly format (array of strings) to a
// code-friendlier format (objects).
// Users specify a list of identifiers.
export const parseSelectors = function (rawSelectors, propName, combinations) {
  return rawSelectors.map((rawSelector) =>
    parseSelector(rawSelector, propName, combinations),
  )
}

const parseSelector = function (rawSelector, propName, combinations) {
  const { ids, negation } = tokenizeSelector(rawSelector, propName)
  const intersect = groupByCategory(ids, combinations)
  return { intersect, negation }
}

// Users do not specify the identifier's category, since we can guess this, in
// order to simplify the syntax.
// However, we do need to group identifiers by category since identifiers of
// the same category use unions while identifiers of different categories use
// intersection.
const groupByCategory = function (ids, combinations) {
  const combinationsIds = getCombinationsIds(combinations)
  const tokens = ids.map((id) => addTokenCategory(id, combinationsIds))
  const categories = getCategories(tokens)
  return categories.map((category) => getCategoryIds(tokens, category))
}

// Some `ids` might not be found in combinations. This is because they might:
//  - Have been previously filtered, removing the combinations where those ids
//    were defined
//  - Not be recent, with different/older ids
//  - Come from a shared configuration which might not perfectly match the
//    current benchmark's ids.
// `ids` with unknown categories are grouped together and will never match.
const addTokenCategory = function (id, combinationsIds) {
  const idInfoA = combinationsIds.find((idInfo) => idInfo.id === id)
  const category = idInfoA === undefined ? 'unknown' : idInfoA.category
  return { id, category }
}

const getCategories = function (tokens) {
  const categories = tokens.map(getCategory)
  return [...new Set(categories)]
}

const getCategory = function ({ category }) {
  return category
}

const getCategoryIds = function (tokens, category) {
  return tokens.filter((token) => token.category === category).map(getId)
}

const getId = function ({ id }) {
  return id
}
