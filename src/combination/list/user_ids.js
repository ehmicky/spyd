import { getCombsDimensionsIds } from '../ids.js'
import { getInputIds } from '../inputs.js'

// Retrieve user-defined identifiers
export const getUserIds = function (combinations, inputsList) {
  const dimensionsIds = getCombsDimensionsIds(combinations)
    .filter(isUserId)
    .map(getCombinationUserId)
  const nonCombinationsIds = getNonCombinationsIds(inputsList)
  return [...dimensionsIds, ...nonCombinationsIds]
}

const isUserId = function ({ dimension: { createdByUser } }) {
  return createdByUser
}

const getCombinationUserId = function ({ dimension: { messageName }, id }) {
  return { messageName, id }
}

// Identifiers that do not relate to dimensions/combinations
const getNonCombinationsIds = function (inputsList) {
  return NON_COMBINATION_IDS.flatMap(({ messageName, getIds }) =>
    listNonCombinationIds(messageName, getIds, inputsList),
  )
}

const listNonCombinationIds = function (messageName, getIds, inputsList) {
  const ids = getIds(inputsList)
  return ids.map((id) => ({ messageName, id }))
}

const NON_COMBINATION_IDS = [{ messageName: 'input', getIds: getInputIds }]
