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
export const DIMENSIONS = [
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

// Retrieve combinations' dimensions.
// Follows `DIMENSIONS` array order.
export const getDimensions = function (combinations) {
  return DIMENSIONS.filter((dimension) =>
    haveDimension(combinations, dimension),
  ).map(getDimensionPropName)
}

const haveDimension = function (combinations, dimension) {
  return combinations.some((combination) =>
    combinationHasDimension(combination, dimension),
  )
}

export const combinationHasDimension = function ({ dimensions }, { propName }) {
  return dimensions[propName] !== undefined
}

const getDimensionPropName = function ({ propName }) {
  return propName
}
