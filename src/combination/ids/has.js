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

const isSameId = function (dimensionsIdA, dimensionsIdB) {
  return dimensionsIdA.id === dimensionsIdB.id
}

const isSameDimension = function (dimensionsIdA, dimensionsIdB) {
  return dimensionsIdA.dimension.propName === dimensionsIdB.dimension.propName
}
