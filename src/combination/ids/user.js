import { getInputIds } from '../inputs.js'

import { getCombsDimensionsIds } from './get.js'

// Retrieve user-defined identifiers
export const getUserIds = (combinations, inputsList) => {
  const dimensionsIds = getCombsDimensionsIds(combinations)
    .filter(isUserId)
    .map(getCombinationUserId)
  const nonCombinationsIds = getNonCombinationsIds(inputsList)
  return [...dimensionsIds, ...nonCombinationsIds]
}

const isUserId = ({ dimension: { createdByUser } }) => createdByUser

const getCombinationUserId = ({ dimension: { messageName }, id }) => ({
  messageName,
  id,
})

// Identifiers that do not relate to dimensions/combinations
const getNonCombinationsIds = (inputsList) =>
  NON_COMBINATION_IDS.flatMap(({ messageName, getIds }) =>
    listNonCombinationIds({ messageName, getIds, inputsList }),
  )

const listNonCombinationIds = ({ messageName, getIds, inputsList }) => {
  const ids = getIds(inputsList)
  return ids.map((id) => ({ messageName, id }))
}

const NON_COMBINATION_IDS = [{ messageName: 'input', getIds: getInputIds }]
