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
const DIMENSIONS_ARRAY = [
  {
    // Name used as property internally and when saving
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

// Turn dimensions array into an object
const getDimensions = function () {
  return Object.fromEntries(DIMENSIONS_ARRAY.map(getDimensionPair))
}

const getDimensionPair = function (dimension) {
  return [dimension.propName, dimension]
}

export const DIMENSIONS = getDimensions()
