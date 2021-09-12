// All dimensions. They:
//  - create dimensions in runs using a cartesian product
//  - can be used in `select|limit`
//  - are printed when naming the combination
//     - in reporters, preview bottom bar, `dev`, error messages
//     - in some of those cases, `titles` are applied too
// The order is significant as it defines:
//  - The sorting order of combinations in reporters
//  - The order of dimensions when printing combinationName in reporters,
//    previews and `dev`
export const DIMENSIONS = [
  {
    // Name used as property internally and when saving
    propName: 'task',
    // Name used in output and error messages
    messageName: 'task',
    // Property name for the identifier
    idName: 'id',
    // Property name for the title
    titleName: 'taskTitle',
    // Whether dimension was created by users or by plugins
    createdByUser: true,
  },
  {
    propName: 'runner',
    messageName: 'runner',
    idName: 'id',
    titleName: 'runnerTitle',
    createdByUser: false,
  },
  {
    propName: 'system',
    messageName: 'system',
    idName: 'systemId',
    titleName: 'systemTitle',
    createdByUser: true,
  },
]
