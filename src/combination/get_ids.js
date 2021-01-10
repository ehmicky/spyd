// Retrieve all unique user-selected identifiers:
// task, system, runner, variations, inputs
export const getCombinationsIds = function (combinations, inputs) {
  const nonCombinationIds = getNonCombinationsIds(inputs)
  const combinationsA = combinations.map(addIdInfos)
  const combinationsB = combinationsA.map(addCombinationIds)
  const combinationsIds = getAllCombinationsIds(combinationsA)
  return { combinations: combinationsB, combinationsIds, nonCombinationIds }
}

// Non-combination identifiers are identifiers which do not create a new
// dimension. Therefore they cannot be used in `include`, `exclude`, `limit`,
// etc.
// They are not checked for duplicates, but they are validated against allowed
// characters.
const getNonCombinationsIds = function (inputs) {
  return NON_COMBINATION_IDS.flatMap(
    getNonCombinationIds.bind(undefined, inputs),
  )
}

const getNonCombinationIds = function (inputs, { type, getIds }) {
  return getIds(inputs).map((id) => ({ type, id }))
}

const getInputIds = function (inputs) {
  return inputs.map(getInputId)
}

const getInputId = function ({ inputId }) {
  return inputId
}

const NON_COMBINATION_IDS = [{ type: 'input', getIds: getInputIds }]

const addIdInfos = function (combination) {
  const idInfos = COMBINATION_IDS.map(getIdInfo.bind(undefined, combination))
  return { ...combination, idInfos }
}

const COMBINATION_IDS = [
  { type: 'task', idName: 'taskId' },
  { type: 'system', idName: 'systemId' },
  { type: 'runner', idName: 'runnerId' },
]

const getIdInfo = function (combination, { type, idName }) {
  const id = combination[idName]
  return { type, id }
}

const addCombinationIds = function ({ idInfos, ...combination }) {
  const ids = idInfos.map(getId)
  return { ...combination, ids }
}

const getId = function ({ id }) {
  return id
}

const getAllCombinationsIds = function (combinations) {
  return combinations.flatMap(getCombinationIds).filter(isNotSameTypeDuplicate)
}

const getCombinationIds = function ({ idInfos }) {
  return idInfos
}

// Remove duplicate ids with the same type.
// Duplicate ids with a different type are validated later.
const isNotSameTypeDuplicate = function ({ type, id }, index, idInfos) {
  return !idInfos
    .slice(index + 1)
    .some((idInfo) => idInfo.type === type && idInfo.id === id)
}
