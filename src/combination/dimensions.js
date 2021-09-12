import { getInputIds } from './inputs.js'

// Combination identifiers create a new combination dimension:
// tasks, systems, variations, runners.
// They:
//  - can be used in `select`, `limit`, etc.
//  - are checked for duplicates
// As opposed to non-combination identifiers: inputs.
// The order is significant as it defines:
//  - The sorting order in reporters
//  - The order when printing combinationName in previews and `dev`
export const COMBINATION_DIMENSIONS = [
  {
    dimension: 'task',
    idName: 'taskId',
  },
  {
    dimension: 'runner',
    idName: 'runnerId',
  },
  {
    dimension: 'system',
    idName: 'systemId',
  },
]

export const N_COMBINATION_DIMENSIONS = [
  {
    dimension: 'input',
    getIds: getInputIds,
  },
]
