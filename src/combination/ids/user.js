import { getMergeIdsArray } from '../../history/merge/prop.js'
import { getInputIds } from '../inputs.js'

import { getCombsDimensionsIds } from './get.js'

// Retrieve user-defined identifiers
export const getUserIds = function (combinations, inputsList, merge) {
  const dimensionsIds = getCombsDimensionsIds(combinations)
    .filter(isUserId)
    .map(getCombinationUserId)
  const nonCombinationsIds = getNonCombinationsIds(inputsList, merge)
  return [...dimensionsIds, ...nonCombinationsIds]
}

const isUserId = function ({ dimension: { createdByUser } }) {
  return createdByUser
}

const getCombinationUserId = function ({ dimension: { messageName }, id }) {
  return { messageName, id }
}

// Identifiers that do not relate to dimensions/combinations
const getNonCombinationsIds = function (inputsList, merge) {
  return NON_COMBINATION_IDS.flatMap(({ messageName, getIds }) =>
    listNonCombinationIds({ messageName, getIds, inputsList, merge }),
  )
}

const listNonCombinationIds = function ({
  messageName,
  getIds,
  inputsList,
  merge,
}) {
  const ids = getIds({ inputsList, merge })
  return ids.map((id) => ({ messageName, id }))
}

const NON_COMBINATION_IDS = [
  { messageName: 'input', getIds: getInputIds },
  { messageName: '"merge" configuration property', getIds: getMergeIdsArray },
]
