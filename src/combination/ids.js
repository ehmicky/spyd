import { titleColor, separatorColor } from '../report/utils/colors.js'

import {
  COMBINATION_CATEGORIES,
  NON_COMBINATION_CATEGORY,
} from './categories.js'

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

export const getCombinationName = function (combination) {
  return getIdInfos(combination).map(getCategoryName).join(separatorColor(', '))
}

const getCategoryName = function ({ category, id }) {
  return `${separatorColor(category)} ${titleColor(id)}`
}

const getIdInfos = function (combination) {
  return COMBINATION_CATEGORIES.map(getIdInfo.bind(undefined, combination))
}

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
  return NON_COMBINATION_CATEGORY.flatMap(
    getNonCombinationIds.bind(undefined, inputs),
  )
}

const getNonCombinationIds = function (inputs, { category, getIds }) {
  return getIds(inputs).map((id) => ({ category, id }))
}
