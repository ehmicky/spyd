import { getCombDimensions } from './dimensions.js'

// Check if two combinations have same identifiers for all dimensions
export const hasSameCombinationIds = function (combinationA, combinationB) {
  const dimensionsIdsA = getDimensionIds(combinationA)
  const dimensionsIdsB = getDimensionIds(combinationB)
  return dimensionsIdsA.every(
    ({ id }, index) => dimensionsIdsB[index].id === id,
  )
}

// Retrieve all unique combinations identifiers.
// For all combinations of a given result.
export const getCombinationsIds = function (combinations) {
  return combinations.flatMap(getDimensionIds).filter(isNotDuplicateId)
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

// Retrieve each dimension's id of a given combination
// Does not follow `DIMENSIONS` array order.
export const getCombinationIds = function (combination) {
  return Object.values(combination.dimensions).map(getCombinationId)
}

const getCombinationId = function ({ id }) {
  return id
}
