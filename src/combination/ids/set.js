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

// When updating `rawResult.combinations[*].dimensions[*].id`, we need to also
// update some properties in `rawResult` which have the same value,
// such as `rawResult.system.id`.
export const syncDimensionIds = function (rawResult) {
  return renameSystemIds(rawResult)
}

// System ids are persisted in two places: `rawResult.system.id` and
// `rawResult.combinations[*].dimensions.system`.
// We need to update the former.
const renameSystemIds = function (rawResult) {
  const { id } = rawResult.combinations[0].dimensions.system
  return rawResult.system.id === id
    ? rawResult
    : { ...rawResult, system: { ...rawResult.system, id } }
}
