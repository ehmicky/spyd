export const SYSTEM_PREFIX = 'system.'

// All dimensions. They:
//  - create dimensions in runs using a cartesian product
//  - can be used in `select|limit`
//  - are printed when naming the combination
//     - in reporters, preview bottom bar, `dev`, error messages
//     - in some of those cases, `titles` are applied too
// The order is significant as it defines:
//  - The sorting order of combinations in reporters
//  - The order of dimensions when printed
const DIMENSIONS = [
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
    // Instead of a `propName`, those have a common `propPrefix`.
    propPrefix: SYSTEM_PREFIX,
    createdByUser: true,
  },
]

// Retrieve several combinations' dimensions.
export const getCombsDimensions = function (combinations) {
  return combinations.flatMap(getCombDimensions).filter(isUniqueCombDimension)
}

const isUniqueCombDimension = function (combDimension, index, combDimensions) {
  return combDimensions
    .slice(index + 1)
    .every(({ propName }) => combDimension.propName !== propName)
}

// Retrieve one combination's dimensions.
// Array order follows:
//  - `DIMENSIONS` order
//  - For dynamic dimensions, property order, i.e. user order specified in
//    configuration
export const getCombDimensions = function (combination) {
  return DIMENSIONS.flatMap((dimension) => getDimension(combination, dimension))
}

// We dissociate:
//  - `propName`: used internally and when saving
//  - `messageName`: used in output and error messages
// However, those are currently identical for the sets of dimensions.
const getDimension = function (
  { dimensions },
  { propName: dimensionPropName, propPrefix, createdByUser },
) {
  return Object.keys(dimensions)
    .filter((propName) => isDimension(propName, dimensionPropName, propPrefix))
    .map((propName) => ({
      propName,
      messageName: getMessageName(propName, propPrefix),
      createdByUser,
    }))
}

const isDimension = function (propName, dimensionPropName, propPrefix) {
  return propPrefix === undefined
    ? propName === dimensionPropName
    : propName.startsWith(propPrefix)
}

const getMessageName = function (propName, propPrefix) {
  return propPrefix === undefined ? propName : propName.slice(propPrefix.length)
}
