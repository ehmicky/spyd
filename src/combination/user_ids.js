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
  return Object.entries(NON_COMBINATION_IDS).flatMap(([dimension, getIds]) =>
    listNonCombinationIds(dimension, getIds, inputs),
  )
}

const listNonCombinationIds = function (dimension, getIds, inputs) {
  const ids = getIds(inputs)
  return ids.map((id) => ({ dimension, id }))
}

const NON_COMBINATION_IDS = {
  input: getInputIds,
}
