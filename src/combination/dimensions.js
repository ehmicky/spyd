// All dimensions. They:
//  - create dimensions in runs using a cartesian product
//  - can be used in `select|limit`
//  - are printed when naming the combination
//     - in reporters, preview bottom bar, `dev`, error messages
//     - in some of those cases, `titles` are applied too
// The order is significant as it defines:
//  - The sorting order of combinations in reporters
//  - The order of dimensions when printing:
//     - combinationName in previews, `dev` and error messages
//     - combinationTitle in reporters
const DIMENSIONS = [
  {
    // Name used as property internally and when saving.
    propName: 'task',
    // Name used in output and error messages
    messageName: 'task',
    // Whether dimension was created by users or by plugins
    createdByUser: true,
  },
  {
    propName: 'runner',
    messageName: 'runner',
    createdByUser: false,
  },
  {
    propName: 'system',
    messageName: 'system',
    createdByUser: true,
  },
]

// Retrieve several combinations' dimensions.
// Follows `DIMENSIONS` array order.
export const getCombsDimensions = function (combinations) {
  return DIMENSIONS.filter((dimension) =>
    combsHaveDimension(combinations, dimension),
  )
}

const combsHaveDimension = function (combinations, dimension) {
  return combinations.some((combination) =>
    combHasDimension(combination, dimension),
  )
}

// Retrieve one combination's dimensions.
// Follows `DIMENSIONS` array order.
export const getCombDimensions = function (combination) {
  return DIMENSIONS.filter((dimension) =>
    combHasDimension(combination, dimension),
  )
}

const combHasDimension = function (combination, dimension) {
  return combination.dimensions[dimension.propName] !== undefined
}
