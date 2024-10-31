import { getCombDimensions, getCombsDimensions } from '../dimensions.js'

import { removeDuplicateIds } from './has.js'

// Retrieve each dimension's id of a given combination
// Follows `DIMENSIONS` array order.
export const getCombinationIds = (combination) =>
  getCombDimensionsIds(combination).map(getCombinationId)

const getCombinationId = ({ id }) => id

// Retrieve all unique combinations identifiers.
// For all combinations of a given result.
// Follows `DIMENSIONS` array order.
export const getCombsDimensionsIds = (combinations) => {
  const dimensions = getCombsDimensions(combinations)
  const dimensionsIds = dimensions.flatMap((dimension) =>
    getCombsDimensionIds(combinations, dimension),
  )
  return removeDuplicateIds(dimensionsIds)
}

// Retrieve a dimension and its id for a given dimension
const getCombsDimensionIds = (combinations, dimension) =>
  combinations.map((combination) => getDimensionId(combination, dimension))

// Retrieve each dimension and its id for a given combination
// Follows `DIMENSIONS` array order.
export const getCombDimensionsIds = (combination) => {
  const dimensions = getCombDimensions(combination)
  return dimensions.map((dimension) => getDimensionId(combination, dimension))
}

// Retrieve a dimensionId for a given combination's dimension
const getDimensionId = (combination, dimension) => {
  const { id } = combination.dimensions[dimension.propName]
  return { id, dimension }
}
