import { getCombsDimensions, isDimension, DIMENSIONS } from './dimensions.js'
import { removePrefix } from './prefix.js'

// The target result defines which combinations are reported.
// A history result might miss one of them:
//  - This only happens for dynamic dimensions (like systems and variations)
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
export const addDefaultIds = function (results, combinations) {
  const defaultDimensions = getDefaultDimensions(combinations)
  return results.map((result) => addResultDefaultIds(result, defaultDimensions))
}

const getDefaultDimensions = function (combinations) {
  const targetDimensions = getCombsDimensions(combinations)
  return Object.fromEntries(
    targetDimensions.filter(hasDefaultId).map(getDefaultDimension),
  )
}

const hasDefaultId = function ({ defaultIdPrefix }) {
  return defaultIdPrefix !== undefined
}

const getDefaultDimension = function (dimension) {
  const id = getDefaultId(dimension.propName, dimension)
  return [dimension.propName, { id }]
}

const addResultDefaultIds = function (result, defaultDimensions) {
  const combinations = result.combinations.map((combination) => ({
    ...combination,
    dimensions: { ...defaultDimensions, ...combination.dimensions },
  }))
  return { ...result, combinations }
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

const isDimensionDefaultId = function (id, propName, dimension) {
  return (
    isDimension(propName, dimension.propName, dimension.prefixName) &&
    id === getDefaultId(propName, dimension)
  )
}

// Retrieve the default id of a dimension
const getDefaultId = function (propName, { prefixName, defaultIdPrefix }) {
  const propNameA = removePrefix(propName, prefixName)
  const propNameB = propNameA.replace(DOT_REGEXP, '_')
  return `${defaultIdPrefix}${propNameB}`
}

const DOT_REGEXP = /\./gu
