import { findLast } from '../../utils/find.js'

// Remove duplicate ids with the same dimension, since this happens due to the
// cartesian product.
// Duplicate ids with a different dimension are validated later.
export const removeDuplicateIds = function (dimensionsIds) {
  return dimensionsIds.filter(isNotDuplicateId)
}

const isNotDuplicateId = function (dimensionsIdA, index, dimensionsIds) {
  const previousDimensionsIds = dimensionsIds.slice(0, index)
  return !hasSameDimensionsIds(previousDimensionsIds, dimensionsIdA)
}

const hasSameDimensionsIds = function (dimensionsIdsA, dimensionsIdB) {
  return dimensionsIdsA.some(
    (dimensionsIdA) =>
      isSameId(dimensionsIdA, dimensionsIdB) &&
      isSameDimension(dimensionsIdA, dimensionsIdB),
  )
}

// Checks if any `dimensionsIdsA` have the same `id` but a different dimension.
// As a performance optimization, this relies on the following assumption:
// it is not possible for `dimensionsIdsA` to contain the same `id` both in the
// same and another dimension.
export const hasCrossDimensionsIds = function (dimensionsIdsA, dimensionIdB) {
  const similarDimensionId = findSameId(dimensionsIdsA, dimensionIdB)
  return (
    similarDimensionId !== undefined &&
    !isSameDimension(similarDimensionId, dimensionIdB)
  )
}

// Find any `dimensionsIdA` with same `id` as `dimensionIdB`.
// Since matching ids are more likely towards the end, use `findLast()`.
export const findSameId = function (dimensionsIdsA, dimensionIdB) {
  return findLast(dimensionsIdsA, (dimensionIdA) =>
    isSameId(dimensionIdA, dimensionIdB),
  )
}

const isSameId = function (dimensionsIdA, dimensionsIdB) {
  return dimensionsIdA.id === dimensionsIdB.id
}

export const isSameDimension = function (dimensionsIdA, dimensionsIdB) {
  return dimensionsIdA.dimension.propName === dimensionsIdB.dimension.propName
}
