// Remove duplicate ids with the same dimension, since this happens due to the
// cartesian product.
// Duplicate ids with a different dimension are validated later.
export const removeDuplicateIds = (dimensionsIds) =>
  dimensionsIds.filter(isNotDuplicateId)

const isNotDuplicateId = (dimensionsIdA, index, dimensionsIds) => {
  const previousDimensionsIds = dimensionsIds.slice(0, index)
  return !hasSameDimensionsIds(previousDimensionsIds, dimensionsIdA)
}

const hasSameDimensionsIds = (dimensionsIdsA, dimensionsIdB) =>
  dimensionsIdsA.some(
    (dimensionsIdA) =>
      isSameId(dimensionsIdA, dimensionsIdB) &&
      isSameDimension(dimensionsIdA, dimensionsIdB),
  )

const isSameId = (dimensionsIdA, dimensionsIdB) =>
  dimensionsIdA.id === dimensionsIdB.id

const isSameDimension = (dimensionsIdA, dimensionsIdB) =>
  dimensionsIdA.dimension.propName === dimensionsIdB.dimension.propName
