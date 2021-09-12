import { getCombinationsIds } from '../ids.js'
import { getInputIds } from '../inputs.js'

// Retrieve user-defined identifiers
export const getUserIds = function (combinations, inputs) {
  const combinationsUserIds = getCombinationsIds(combinations)
    .filter(isUserId)
    .map(getCombinationUserId)
  const nonCombinationsIds = getNonCombinationsIds(inputs)
  return [...combinationsUserIds, ...nonCombinationsIds]
}

const isUserId = function ({ dimension: { createdByUser } }) {
  return createdByUser
}

const getCombinationUserId = function ({ dimension: { mainName }, id }) {
  return { mainName, id }
}

// Identifiers that do not relate to dimensions/combinations
const getNonCombinationsIds = function (inputs) {
  return Object.entries(NON_COMBINATION_IDS).flatMap(([dimension, getIds]) =>
    listNonCombinationIds(dimension, getIds, inputs),
  )
}

const listNonCombinationIds = function (mainName, getIds, inputs) {
  const ids = getIds(inputs)
  return ids.map((id) => ({ mainName, id }))
}

const NON_COMBINATION_IDS = {
  input: getInputIds,
}
