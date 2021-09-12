import { titleColor, noteColor } from '../report/utils/colors.js'

import { DIMENSIONS, USER_DIMENSIONS } from './dimensions.js'
import { getInputIds } from './inputs.js'

export const getCombinationName = function (combination) {
  return getCombinationIds(combination)
    .map(getCombinationNamePart)
    .join(noteColor(', '))
}

const getCombinationNamePart = function ({ dimension, id }, index) {
  const dimensionA = index === 0 ? titleize(dimension) : dimension
  return `${noteColor(dimensionA)} ${titleColor(id)}`
}

const titleize = function (string) {
  return `${string.charAt(0).toUpperCase()}${string.slice(1)}`
}

// Retrieve user-defined identifiers
export const getUserIds = function (combinations, inputs) {
  const combinationsUserIds = getCombinationsIds(combinations).filter(isUserId)
  const nonCombinationsIds = getNonCombinationsIds(inputs)
  return [...combinationsUserIds, ...nonCombinationsIds]
}

const isUserId = function ({ dimension }) {
  return USER_DIMENSIONS.has(dimension)
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

// Check if two combinations have same identifiers for all dimensions
export const hasSameCombinationIds = function (combinationA, combinationB) {
  const combinationIdsA = getCombinationIds(combinationA)
  const combinationIdsB = getCombinationIds(combinationB)
  return combinationIdsA.every(
    ({ id }, index) => combinationIdsB[index].id === id,
  )
}

// Retrieve all unique combinations identifiers.
// For all combinations of a given result.
export const getCombinationsIds = function (combinations) {
  return combinations.flatMap(getCombinationIds).filter(isNotDuplicate)
}

export const getCombinationIds = function (combination) {
  return DIMENSIONS.map(({ dimension, idName }) => ({
    dimension,
    id: combination[idName],
  }))
}

// Remove duplicate ids with the same dimension, since this happens due to the
// cartesian product.
// Duplicate ids with a different dimension are validated later.
const isNotDuplicate = function ({ dimension, id }, index, idInfos) {
  return !idInfos
    .slice(index + 1)
    .some((idInfo) => idInfo.dimension === dimension && idInfo.id === id)
}
