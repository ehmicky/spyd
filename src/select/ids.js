// Retrieve user-defined identifiers: tasks, systems, variations, inputs
// They are checked for allowed characters.
// As opposed to plugin-defined identifiers: runners
export const getUserIds = function (combinations, inputs) {
  const combinationsIds = getCombinationsIds(combinations)
  const nonCombinationIds = getNonCombinationsIds(inputs)
  const userIds = [...combinationsIds, ...nonCombinationIds].filter(isUserId)
  return userIds
}

const isUserId = function ({ category }) {
  return USER_ID_CATEGORIES.has(category)
}

const USER_ID_CATEGORIES = new Set(['task', 'system', 'input'])

// Combination identifiers create a new combination category:
// tasks, systems, variations, runners.
// They:
//  - can be used in `include`, `exclude`, `limit`, etc.
//  - are checked for duplicates
// As opposed to non-combination identifiers: inputs.
export const isSameCategory = function (combinationA, combinationB) {
  return COMBINATION_CATEGORIES.every(
    ({ idName }) => combinationA[idName] === combinationB[idName],
  )
}

// Retrieve all unique combinations identifiers.
// For all combinations of a given result.
export const getCombinationsIds = function (combinations) {
  return combinations.flatMap(getIdInfos).filter(isNotSameCatDuplicate)
}

// Same but for a single combination
export const getCombinationIds = function (combination) {
  return getIdInfos(combination).map(getId)
}

const getIdInfos = function (combination) {
  return COMBINATION_CATEGORIES.map(getIdInfo.bind(undefined, combination))
}

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

const getIdInfo = function (combination, { category, idName }) {
  const id = combination[idName]
  return { category, id }
}

const getId = function ({ id }) {
  return id
}

// Remove duplicate ids with the same category, since this happens due to the
// cartesian product.
// Duplicate ids with a different category are validated later.
const isNotSameCatDuplicate = function ({ category, id }, index, idInfos) {
  return !idInfos
    .slice(index + 1)
    .some((idInfo) => idInfo.category === category && idInfo.id === id)
}

// Retrieve non-combination identifiers.
const getNonCombinationsIds = function (inputs) {
  return NON_COMBINATION_IDS.flatMap(
    getNonCombinationIds.bind(undefined, inputs),
  )
}

const getNonCombinationIds = function (inputs, { category, getIds }) {
  return getIds(inputs).map((id) => ({ category, id }))
}

const getInputIds = function (inputs) {
  return inputs.map(getInputId)
}

const getInputId = function ({ inputId }) {
  return inputId
}

const NON_COMBINATION_IDS = [{ category: 'input', getIds: getInputIds }]
