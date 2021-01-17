// Combination identifiers create a new combination category:
// tasks, systems, variations, runners.
// They:
//  - can be used in `include`, `exclude`, `limit`, etc.
//  - are checked for duplicates
// As opposed to non-combination identifiers: inputs.
export const COMBINATION_CATEGORIES = [
  {
    category: 'task',
    propName: 'tasks',
    idName: 'taskId',
    titleName: 'taskTitle',
    rankName: 'taskRank',
  },
  {
    category: 'runner',
    propName: 'runners',
    idName: 'runnerId',
    titleName: 'runnerTitle',
    rankName: 'runnerRank',
  },
  {
    category: 'system',
    propName: 'systems',
    idName: 'systemId',
    titleName: 'systemTitle',
    rankName: 'systemRank',
  },
]

const getInputIds = function (inputs) {
  return inputs.map(getInputId)
}

const getInputId = function ({ inputId }) {
  return inputId
}

export const NON_COMBINATION_CATEGORY = [
  { category: 'input', getIds: getInputIds },
]
