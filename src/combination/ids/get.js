import { getCombsDimensions, getCombDimensions } from '../dimensions.js'

import { removeDuplicateIds } from './has.js'

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
  const dimensionsIds = dimensions.flatMap((dimension) =>
    getCombsDimensionIds(combinations, dimension),
  )
  return removeDuplicateIds(dimensionsIds)
}

// Retrieve a dimension and its id for a given dimension
const getCombsDimensionIds = function (combinations, dimension) {
  return combinations.map((combination) =>
    getDimensionId(combination, dimension),
  )
}

// Retrieve each dimension and its id for a given combination
// Follows `DIMENSIONS` array order.
export const getCombDimensionsIds = function (combination) {
  const dimensions = getCombDimensions(combination)
  return dimensions.map((dimension) => getDimensionId(combination, dimension))
}

// Retrieve a dimensionId for a given combination's dimension
export const getDimensionId = function (combination, dimension) {
  const { id } = combination.dimensions[dimension.propName]
  return { id, dimension }
}

// Rename the `id` of a dimensionId for a given combination's dimension
export const setDimensionId = function (
  combination,
  { id, dimension: { propName } },
) {
  return {
    ...combination,
    dimensions: {
      ...combination.dimensions,
      [propName]: { ...combination.dimensions[propName], id },
    },
  }
}
