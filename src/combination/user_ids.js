import { DIMENSIONS } from './dimensions.js'
import { getCombinationsIds } from './ids.js'
import { getInputIds } from './inputs.js'

// Retrieve user-defined identifiers
export const getUserIds = function (combinations, inputs) {
  const combinationsUserIds = getCombinationsIds(combinations).filter(isUserId)
  const nonCombinationsIds = getNonCombinationsIds(inputs)
  return [...combinationsUserIds, ...nonCombinationsIds]
}

const isUserId = function (combinationId) {
  return DIMENSIONS.find(
    ({ dimension }) => combinationId.dimension === dimension,
  ).createdByUser
}

// Identifiers that do not relate to dimensions/combinations
const getNonCombinationsIds = function (inputs) {
  return NON_COMBINATION_IDS.flatMap(({ dimension, getIds }) =>
    listNonCombinationIds(dimension, getIds, inputs),
  )
}

const NON_COMBINATION_IDS = [
  {
    dimension: 'input',
    getIds: getInputIds,
  },
]

const listNonCombinationIds = function (dimension, getIds, inputs) {
  return getIds(inputs).map((id) => ({ dimension, id }))
}
