import { getCombsDimensions, getCombDimensions } from './dimensions.js'

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
  return getDimensionIds(combination).map(getCombinationId)
}

const getCombinationId = function ({ id }) {
  return id
}

// Retrieve all unique combinations identifiers.
// For all combinations of a given result.
// Follows `DIMENSIONS` array order.
export const getAllDimensionIds = function (combinations) {
  const dimensions = getCombsDimensions(combinations)
  return dimensions
    .flatMap((dimension) =>
      combinations.map((combination) => getDimensionId(combination, dimension)),
    )
    .filter(isNotDuplicateId)
}

// Remove duplicate ids with the same dimension, since this happens due to the
// cartesian product.
// Duplicate ids with a different dimension are validated later.
const isNotDuplicateId = function ({ dimension, id }, index, combinationIds) {
  return !combinationIds
    .slice(0, index)
    .some(
      (combinationId) =>
        combinationId.dimension.propName === dimension.propName &&
        combinationId.id === id,
    )
}

// Retrieve each dimension and its for a given combination
// Follows `DIMENSIONS` array order.
export const getDimensionIds = function (combination) {
  const dimensions = getCombDimensions(combination)
  return dimensions.map((dimension) => getDimensionId(combination, dimension))
}

const getDimensionId = function (combination, dimension) {
  const { id } = combination.dimensions[dimension.propName]
  return { id, dimension }
}
