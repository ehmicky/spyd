import { DIMENSIONS, combinationHasDimension } from './dimensions.js'

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
  return combinations.flatMap(getCombinationIds).filter(isNotDuplicateId)
}

// Remove duplicate ids with the same dimension, since this happens due to the
// cartesian product.
// Duplicate ids with a different dimension are validated later.
const isNotDuplicateId = function ({ dimension, id }, index, combinationIds) {
  return !combinationIds
    .slice(index + 1)
    .some(
      (combinationId) =>
        combinationId.dimension.propName === dimension.propName &&
        combinationId.id === id,
    )
}

// Retrieve each dimension's id of a given combination
// Follows `DIMENSIONS` array order.
export const getCombinationIds = function (combination) {
  return DIMENSIONS.filter((dimension) =>
    combinationHasDimension(combination, dimension),
  ).map((dimension) => getCombinationId(combination, dimension))
}

const getCombinationId = function (combination, dimension) {
  const { id } = combination.dimensions[dimension.propName]
  return { id, dimension }
}
