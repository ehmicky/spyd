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

// Remove duplicate ids with the same dimension, since this happens due to the
// cartesian product.
// Duplicate ids with a different dimension are validated later.
const isNotDuplicate = function ({ dimension, id }, index, combinationIds) {
  return !combinationIds
    .slice(index + 1)
    .some(
      (combinationId) =>
        combinationId.dimension === dimension && combinationId.id === id,
    )
}

// Retrieve each dimension's id of a given combination
export const getCombinationIds = function (combination) {
  return DIMENSIONS.map((dimension) => ({
    dimension,
    id: combination.dimensions[dimension.propName][dimension.idName],
  }))
}

export const getDimensionId = function (propName, { dimensions }) {
  const { idName } = DIMENSIONS.find(
    (dimension) => dimension.propName === propName,
  )
  return dimensions[propName][idName]
}

export const getDimensionTitle = function (propName, { dimensions }) {
  const { titleName } = DIMENSIONS.find(
    (dimension) => dimension.propName === propName,
  )
  return dimensions[propName][titleName]
}
