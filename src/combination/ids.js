import { titleColor, noteColor } from '../report/utils/colors.js'

import { COMBINATION_DIMENSIONS, USER_DIMENSIONS } from './dimensions.js'
import { getInputIds } from './inputs.js'

export const isSameDimension = function (combinationA, combinationB) {
  return COMBINATION_DIMENSIONS.every(
    ({ idName }) => combinationA[idName] === combinationB[idName],
  )
}

// Retrieve all unique combinations identifiers.
// For all combinations of a given result.
export const getCombinationsIds = function (combinations) {
  return combinations.flatMap(getIdInfos).filter(isNotSameDimDuplicate)
}

// Same but for a single combination
export const getCombinationIds = function (combination) {
  return getIdInfos(combination).map(getId)
}

export const getCombinationName = function (combination) {
  return getIdInfos(combination).map(getDimensionName).join(noteColor(', '))
}

const getDimensionName = function ({ dimension, id }, index) {
  const dimensionA = index === 0 ? titleize(dimension) : dimension
  return `${noteColor(dimensionA)} ${titleColor(id)}`
}

const titleize = function (string) {
  return `${string.charAt(0).toUpperCase()}${string.slice(1)}`
}

const getIdInfos = function (combination) {
  return COMBINATION_DIMENSIONS.map(getIdInfo.bind(undefined, combination))
}

const getIdInfo = function (combination, { dimension, idName }) {
  const id = combination[idName]
  return { dimension, id }
}

const getId = function ({ id }) {
  return id
}

// Remove duplicate ids with the same dimension, since this happens due to the
// cartesian product.
// Duplicate ids with a different dimension are validated later.
const isNotSameDimDuplicate = function ({ dimension, id }, index, idInfos) {
  return !idInfos
    .slice(index + 1)
    .some((idInfo) => idInfo.dimension === dimension && idInfo.id === id)
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
