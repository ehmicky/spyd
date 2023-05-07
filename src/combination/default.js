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
export const addDefaultIds = (results, combinations) => {
  const defaultDimensions = getDefaultDimensions(combinations)
  return results.map((result) => addResultDefaultIds(result, defaultDimensions))
}

const getDefaultDimensions = (combinations) => {
  const targetDimensions = getCombsDimensions(combinations)
  return Object.fromEntries(
    targetDimensions.filter(hasDefaultId).map(getDefaultDimension),
  )
}

const hasDefaultId = ({ defaultIdPrefix }) => defaultIdPrefix !== undefined

const getDefaultDimension = (dimension) => {
  const id = getDefaultId(dimension.propName, dimension)
  return [dimension.propName, { id }]
}

const addResultDefaultIds = (result, defaultDimensions) => {
  const combinations = result.combinations.map((combination) => ({
    ...combination,
    dimensions: { ...defaultDimensions, ...combination.dimensions },
  }))
  return { ...result, combinations }
}

// Find whether an id matches the default id pattern of a dimension.
export const isInvalidDefaultId = (id, { propName }) =>
  DIMENSIONS.some((dimension) => isInvalidDimensionId(id, propName, dimension))

const isInvalidDimensionId = (id, propName, dimension) =>
  dimension.defaultIdPrefix !== undefined &&
  id.startsWith(dimension.defaultIdPrefix) &&
  !isDimensionDefaultId(id, propName, dimension)

const isDimensionDefaultId = (id, propName, dimension) =>
  isDimension(propName, dimension.propName, dimension.prefixName) &&
  id === getDefaultId(propName, dimension)

// Retrieve the default id of a dimension
const getDefaultId = (propName, { prefixName, defaultIdPrefix }) => {
  const propNameA = removePrefix(propName, prefixName)
  const propNameB = propNameA.replaceAll('.', '_')
  return `${defaultIdPrefix}${propNameB}`
}
