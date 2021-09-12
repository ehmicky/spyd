import { getCombinationsIds } from '../combination/ids.js'

import { tokenizeSelector } from './tokenize.js'

// Parse `select|limit` user-friendly format (array of strings) to a
// code-friendlier format (objects).
// Users specify a list of identifiers.
export const parseSelectors = function (rawSelectors, propName, combinations) {
  return rawSelectors.map((rawSelector) =>
    parseSelector(rawSelector, propName, combinations),
  )
}

const parseSelector = function (rawSelector, propName, combinations) {
  const { ids, negation } = tokenizeSelector(rawSelector, propName)
  const intersect = groupByDimension(ids, combinations)
  return { intersect, negation }
}

// Users do not specify the identifier's dimension, since we can guess this, in
// order to simplify the syntax.
// However, we do need to group identifiers by dimension since identifiers of
// the same dimension use unions while identifiers of different dimensions use
// intersection.
const groupByDimension = function (ids, combinations) {
  const combinationsIds = getCombinationsIds(combinations)
  const tokens = ids.map((id) => addTokenDimension(id, combinationsIds))
  const dimensions = getDimensions(tokens)
  return dimensions.map((dimension) => getDimensionIds(tokens, dimension))
}

// Some `ids` might not be found in combinations. This is because they might:
//  - Have been previously filtered, removing the combinations where those ids
//    were defined
//  - Not be recent, with different/older ids
//  - Come from a shared configuration which might not perfectly match the
//    current benchmark's ids.
// `ids` with unknown dimensions are grouped together and will never match.
const addTokenDimension = function (id, combinationsIds) {
  const idInfoA = combinationsIds.find((idInfo) => idInfo.id === id)
  const dimension = idInfoA === undefined ? 'unknown' : idInfoA.dimension
  return { id, dimension }
}

const getDimensions = function (tokens) {
  const dimensions = tokens.map(getDimension)
  return [...new Set(dimensions)]
}

const getDimension = function ({ dimension }) {
  return dimension
}

const getDimensionIds = function (tokens, dimension) {
  return tokens.filter((token) => token.dimension === dimension).map(getId)
}

const getId = function ({ id }) {
  return id
}
