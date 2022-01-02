import { getCombsDimensions, isDimension, DIMENSIONS } from './dimensions.js'

// The target result defines which combinations are reported.
// A history result might miss one of them:
//  - This only happens for dynamic dimensions (like systems)
//  - And a new dimension was added between the history result and the target
//    result
// In that case, we add that dimension to the history result using a
// dimension-specific default id.
//  - The default id follows predictable patterns so that users can match
//    history combinations, even if they are missing a dimension, by using their
//    default if in the target result
// This ensures history continuity is never lost when adding|removing dynamic
// dimensions:
//  - This is unlike making a missing dimension:
//     - Never match a new dimension: this would create discontinuity in the
//       history
//     - Always match a new dimension: this would make the history non-linear
//       and would most likely lead to unexpected behavior
// This also ensures that all results have the same dimensions and combinations.
// Like this, if a dimension is missing, it can still be:
//  - Comparable in the history
//  - Reported nicely
//  - Selectable with `select`
export const addDefaultIds = function (history, targetResult) {
  const targetDimensions = getCombsDimensions(targetResult.combinations)
  return history.map((rawResult) =>
    addRawResultDefaultIds(rawResult, targetDimensions),
  )
}

// We make sure the new dimensions follow the same order as `targetDimensions`
const addRawResultDefaultIds = function (rawResult, targetDimensions) {
  const combinations = rawResult.combinations.map((combination) =>
    addCombDefaultIds(combination, targetDimensions),
  )
  return { ...rawResult, combinations }
}

// We ensure that all combinations' dimensions objects keys are sorted in the
// same order.
//  - This consistency can be helpful to reporters, although our internal logic
//    does not rely on it
const addCombDefaultIds = function (combination, targetDimensions) {
  const dimensions = Object.fromEntries(
    targetDimensions.map((targetDimension) =>
      getNewDimension(targetDimension, combination.dimensions),
    ),
  )
  return { ...combination, dimensions }
}

const getNewDimension = function ({ propName, getDefaultId }, dimensions) {
  const id =
    propName in dimensions
      ? dimensions[propName]
      : { id: getDefaultId(propName) }
  return [propName, id]
}

// Find whether an id matches the default id pattern of a dimension.
export const isInvalidDefaultId = function (id, { propName }) {
  return DIMENSIONS.some((dimension) =>
    isInvalidDimensionId(id, propName, dimension),
  )
}

const isInvalidDimensionId = function (id, propName, dimension) {
  return (
    dimension.defaultIdPrefix !== undefined &&
    id.startsWith(dimension.defaultIdPrefix) &&
    !isDimensionDefaultId(id, propName, dimension)
  )
}

const isDimensionDefaultId = function (
  id,
  propName,
  { propName: dimensionPropName, prefixName, getDefaultId },
) {
  return (
    isDimension(propName, dimensionPropName, prefixName) &&
    id === getDefaultId(propName)
  )
}
