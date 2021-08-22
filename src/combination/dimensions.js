import { getInputIds } from './inputs.js'

// Combination identifiers create a new combination dimension:
// tasks, systems, variations, runners.
// They:
//  - can be used in `select`, `limit`, etc.
//  - are checked for duplicates
// As opposed to non-combination identifiers: inputs.
export const COMBINATION_DIMENSIONS = [
  {
    dimension: 'task',
    propName: 'tasks',
    idName: 'taskId',
    rankName: 'taskRank',
  },
  {
    dimension: 'runner',
    propName: 'runners',
    idName: 'runnerId',
    rankName: 'runnerRank',
  },
  {
    dimension: 'system',
    propName: 'systems',
    idName: 'systemId',
    rankName: 'systemRank',
  },
]

export const N_COMBINATION_DIMENSIONS = [
  { dimension: 'input', getIds: getInputIds },
]
