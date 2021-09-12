import { getInputIds } from './inputs.js'

// Combination identifiers create a new combination dimension:
// tasks, systems, variations, runners.
// They:
//  - can be used in `select`, `limit`, etc.
//  - are checked for duplicates
// As opposed to non-combination identifiers: inputs.
// The order is significant as it defines:
//  - The sorting order of combinations in reporters
//  - The order of dimensions when printing combinationName in reporters,
//    previews and `dev`
export const COMBINATION_DIMENSIONS = [
  {
    dimension: 'task',
    idName: 'taskId',
    titleName: 'taskTitle',
  },
  {
    dimension: 'runner',
    idName: 'runnerId',
    titleName: 'runnerTitle',
  },
  {
    dimension: 'system',
    idName: 'systemId',
    titleName: 'systemTitle',
  },
]

export const N_COMBINATION_DIMENSIONS = [
  {
    dimension: 'input',
    getIds: getInputIds,
  },
]

// Dimensions created by users, not by plugins
export const USER_DIMENSIONS = new Set(['task', 'system', 'input'])
