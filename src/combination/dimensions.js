import { hasPrefix, removePrefix } from './prefix.js'

// Find a dimension's order
export const findDimensionIndex = (propName) =>
  DIMENSIONS.findIndex((dimension) =>
    isDimension(propName, dimension.propName, dimension.prefixName),
  )

// Retrieve several combinations' dimensions.
// Array order follows same order as `getCombDimensions()`
export const getCombsDimensions = (combinations) =>
  combinations.flatMap(getCombDimensions).filter(isUniqueCombDimension)

const isUniqueCombDimension = (combDimensionA, index, combDimensions) =>
  combDimensions
    .slice(index + 1)
    .every((combDimensionB) => !isSameDimension(combDimensionA, combDimensionB))

const isSameDimension = (dimensionA, dimensionB) =>
  dimensionA.propName === dimensionB.propName

// Retrieve one combination's dimensions.
export const getCombDimensions = (combination) =>
  DIMENSIONS.flatMap((dimension) => getDimension(combination, dimension))

// We dissociate:
//  - `propName`: used internally and when saving
//  - `messageName`: used in output and error messages
const getDimension = (
  { dimensions },
  { propName: dimensionPropName, prefixName, defaultIdPrefix, createdByUser },
) =>
  Object.keys(dimensions)
    .filter((propName) => isDimension(propName, dimensionPropName, prefixName))
    .sort()
    .map((propName) => ({
      propName,
      messageName: getMessageName(propName, prefixName),
      prefixName,
      defaultIdPrefix,
      createdByUser,
    }))

export const isDimension = (propName, dimensionPropName, prefixName) =>
  prefixName === undefined
    ? propName === dimensionPropName
    : hasPrefix(propName, prefixName)

const getMessageName = (propName, prefixName) =>
  prefixName === undefined ? propName : removePrefix(propName, prefixName)

// All dimensions. They:
//  - create dimensions in runs using a cartesian product
//  - can be used in `select` and config selectors
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
    defaultIdPrefix: 'main_system_',
    createdByUser: true,
  },
]
