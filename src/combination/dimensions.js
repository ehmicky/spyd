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
export const DIMENSIONS = {
  task: {
    // Name used as property internally and when saving.
    // Must match the above property name.
    propName: 'task',
    // Name used in output and error messages
    messageName: 'task',
    // Whether dimension was created by users or by plugins
    createdByUser: true,
  },
  runner: {
    propName: 'runner',
    messageName: 'runner',
    createdByUser: false,
  },
  system: {
    propName: 'system',
    messageName: 'system',
    createdByUser: true,
  },
}
