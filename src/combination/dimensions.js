import { hasPrefix, removePrefix } from './prefix.js'

// Find a dimension's order
export const findDimensionIndex = function (propName) {
  return DIMENSIONS.findIndex((dimension) =>
    isDimension(propName, dimension.propName, dimension.prefixName),
  )
}

// Retrieve several combinations' dimensions.
// Array order follows same order as `getCombDimensions()`
export const getCombsDimensions = function (combinations) {
  return combinations.flatMap(getCombDimensions).filter(isUniqueCombDimension)
}

const isUniqueCombDimension = function (combDimensionA, index, combDimensions) {
  return combDimensions
    .slice(index + 1)
    .every((combDimensionB) => !isSameDimension(combDimensionA, combDimensionB))
}

const isSameDimension = function (dimensionA, dimensionB) {
  return dimensionA.propName === dimensionB.propName
}

// Retrieve one combination's dimensions.
export const getCombDimensions = function (combination) {
  return DIMENSIONS.flatMap((dimension) => getDimension(combination, dimension))
}

// We dissociate:
//  - `propName`: used internally and when saving
//  - `messageName`: used in output and error messages
const getDimension = function (
  { dimensions },
  { propName: dimensionPropName, prefixName, getDefaultId, createdByUser },
) {
  // eslint-disable-next-line fp/no-mutating-methods
  return Object.keys(dimensions)
    .filter((propName) => isDimension(propName, dimensionPropName, prefixName))
    .sort()
    .map((propName) => ({
      propName,
      messageName: getMessageName(propName, prefixName),
      getDefaultId,
      createdByUser,
    }))
}

export const isDimension = function (propName, dimensionPropName, prefixName) {
  return prefixName === undefined
    ? propName === dimensionPropName
    : hasPrefix(propName, prefixName)
}

const getMessageName = function (propName, prefixName) {
  return prefixName === undefined
    ? propName
    : removePrefix(propName, prefixName)
}

// All dimensions. They:
//  - create dimensions in runs using a cartesian product
//  - can be used in `select|limit`
//  - are printed when naming the combination
//     - in reporters, preview bottom bar, `dev`, error messages
//     - in some of those cases, `titles` are applied too
export const DIMENSIONS = [
  {
    // Internal persisted property name.
    // Also used to compute the `messageName`.
    propName: 'task',
    // Whether dimension's id was created by users or by plugins
    createdByUser: true,
  },
  {
    propName: 'runner',
    createdByUser: false,
  },
  {
    // Some dimensions are dynamic, i.e. can have multiple sub-dimensions.
    // Instead of a `propName`, those have a common `prefixName`.
    prefixName: 'system',
    getDefaultId: (propName) =>
      `main_system_${removePrefix(propName, 'system')}`,
    defaultIdPrefix: 'main_system_',
    createdByUser: true,
  },
]
