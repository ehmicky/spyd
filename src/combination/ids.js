import { DIMENSIONS } from './dimensions.js'

// Check if two combinations have same identifiers for all dimensions
export const hasSameCombinationIds = function (combinationA, combinationB) {
  const combinationIdsA = getCombinationIds(combinationA)
  const combinationIdsB = getCombinationIds(combinationB)
  return combinationIdsA.every(
    ({ id }, index) => combinationIdsB[index].id === id,
  )
}

// Retrieve combinations' dimensions.
// Follows `DIMENSIONS` array order
export const getDimensions = function (combinations) {
  return Object.values(DIMENSIONS)
    .map(getDimensionPropName)
    .filter((propName) => haveDimension(combinations, propName))
}

const getDimensionPropName = function ({ propName }) {
  return propName
}

const haveDimension = function (combinations, propName) {
  return combinations.some((combination) => hasDimension(combination, propName))
}

const hasDimension = function ({ dimensions }, propName) {
  return dimensions[propName] !== undefined
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
export const getCombinationIds = function ({ dimensions }) {
  return Object.entries(dimensions).map(getCombinationId)
}

const getCombinationId = function ([propName, { id }]) {
  const dimension = DIMENSIONS[propName]
  return { id, dimension }
}
