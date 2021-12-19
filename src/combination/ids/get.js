import { getCombsDimensions, getCombDimensions } from '../dimensions.js'

// Check if two combinations have same identifiers for all dimensions
export const hasSameCombinationIds = function (combinationA, combinationB) {
  const combinationIdsA = getCombinationIds(combinationA)
  const combinationIdsB = getCombinationIds(combinationB)
  return combinationIdsA.every((combinationId) =>
    combinationIdsB.includes(combinationId),
  )
}

// Retrieve each dimension's id of a given combination
// Follows `DIMENSIONS` array order.
export const getCombinationIds = function (combination) {
  return getCombDimensionsIds(combination).map(getCombinationId)
}

const getCombinationId = function ({ id }) {
  return id
}

// Retrieve all unique combinations identifiers.
// For all combinations of a given result.
// Follows `DIMENSIONS` array order.
export const getCombsDimensionsIds = function (combinations) {
  const dimensions = getCombsDimensions(combinations)
  return dimensions
    .flatMap((dimension) => getCombsDimensionIds(combinations, dimension))
    .filter(isNotDuplicateId)
}

// Retrieve a dimension and its id for a given dimension
const getCombsDimensionIds = function (combinations, dimension) {
  return combinations.map((combination) =>
    getDimensionId(combination, dimension),
  )
}

// Remove duplicate ids with the same dimension, since this happens due to the
// cartesian product.
// Duplicate ids with a different dimension are validated later.
const isNotDuplicateId = function ({ dimension, id }, index, dimensionsIds) {
  return !dimensionsIds
    .slice(0, index)
    .some(
      (dimensionsId) =>
        dimensionsId.dimension.propName === dimension.propName &&
        dimensionsId.id === id,
    )
}

// Retrieve each dimension and its id for a given combination
// Follows `DIMENSIONS` array order.
export const getCombDimensionsIds = function (combination) {
  const dimensions = getCombDimensions(combination)
  return dimensions.map((dimension) => getDimensionId(combination, dimension))
}

const getDimensionId = function (combination, dimension) {
  const { id } = combination.dimensions[dimension.propName]
  return { id, dimension }
}
