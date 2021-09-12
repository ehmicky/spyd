import { DIMENSIONS } from './dimensions.js'

// Check if two combinations have same identifiers for all dimensions
export const hasSameCombinationIds = function (combinationA, combinationB) {
  const combinationIdsA = getCombinationIds(combinationA)
  const combinationIdsB = getCombinationIds(combinationB)
  return combinationIdsA.every(
    ({ id }, index) => combinationIdsB[index].id === id,
  )
}

// Retrieve all unique combinations identifiers.
// For all combinations of a given result.
export const getCombinationsIds = function (combinations) {
  return combinations.flatMap(getCombinationIds).filter(isNotDuplicate)
}

export const getCombinationIds = function (combination) {
  return DIMENSIONS.map(({ dimension, idName }) => ({
    dimension,
    id: combination[idName],
  }))
}

// Remove duplicate ids with the same dimension, since this happens due to the
// cartesian product.
// Duplicate ids with a different dimension are validated later.
const isNotDuplicate = function ({ dimension, id }, index, idInfos) {
  return !idInfos
    .slice(index + 1)
    .some((idInfo) => idInfo.dimension === dimension && idInfo.id === id)
}
