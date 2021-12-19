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
    // Dimension test using its internal persisted property name.
    // Some dimensions are dynamic, i.e. can have multiple sub-dimensions.
    isDimension: (propName) => propName === 'task',
    // Name used in output and error messages
    messageName: 'task',
    // Whether dimension's id was created by users or by plugins
    createdByUser: true,
  },
  {
    isDimension: (propName) => propName === 'runner',
    messageName: 'runner',
    createdByUser: false,
  },
  {
    isDimension: (propName) => propName.startsWith('system'),
    messageName: 'system',
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
//  - For dynamic dimensions, lexicographic order of the dimension name
export const getCombDimensions = function (combination) {
  return DIMENSIONS.flatMap((dimension) => getDimension(combination, dimension))
}

const getDimension = function (
  { dimensions },
  { isDimension, messageName, createdByUser },
) {
  return Object.keys(dimensions)
    .filter(isDimension)
    .map((propName) => ({ propName, messageName, createdByUser }))
}
