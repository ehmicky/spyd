import { isDeepStrictEqual } from 'util'

import { titleColor, noteColor } from '../report/utils/colors.js'

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

export const resultHasCombination = function (results, combination) {
  return results.some((result) =>
    hasCombination(result.combinations, combination),
  )
}

export const hasCombination = function (combinations, combinationA) {
  return combinations.some((combinationB) =>
    isSameCategory(combinationA, combinationB),
  )
}

// Return all the combinations that are in `results` but not in `result`
export const getNewIdInfos = function (result, results) {
  const resultIdInfos = getResultIdInfos(result)
  const allIdInfos = getResultsIdInfos(results)
  return allIdInfos.filter((idInfos) =>
    matchesNoIdInfos(idInfos, resultIdInfos),
  )
}

// Return the unique sets of combinations for several results
const getResultsIdInfos = function (results) {
  return results.flatMap(getResultIdInfos).filter(isUniqueCombinationIds)
}

const getResultIdInfos = function ({ combinations }) {
  return combinations.map(getIdInfos)
}

const matchesNoIdInfos = function (idInfosA, resultIdInfos) {
  return !resultIdInfos.some((idInfosB) => isSameIdInfos(idInfosA, idInfosB))
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
  return getIdInfos(combination).map(getCategoryName).join(noteColor(', '))
}

const getCategoryName = function ({ category, id }, index) {
  const categoryA = index === 0 ? titleize(category) : category
  return `${noteColor(categoryA)} ${titleColor(id)}`
}

const titleize = function (string) {
  return `${string.charAt(0).toUpperCase()}${string.slice(1)}`
}

export const getIdInfos = function (combination) {
  return COMBINATION_CATEGORIES.map(getIdInfo.bind(undefined, combination))
}

const getIdInfo = function (combination, { category, idName }) {
  const id = combination[idName]
  return { category, id }
}

const getId = function ({ id }) {
  return id
}

export const isSameIdInfos = function (idInfosA, idInfosB) {
  return isDeepStrictEqual(idInfosA, idInfosB)
}

// Remove duplicate ids with the same category, since this happens due to the
// cartesian product.
// Duplicate ids with a different category are validated later.
const isNotSameCatDuplicate = function ({ category, id }, index, idInfos) {
  return !idInfos
    .slice(index + 1)
    .some((idInfo) => idInfo.category === category && idInfo.id === id)
}

// Check if a combination is present in other results
const isUniqueCombinationIds = function (idInfosA, index, allIdInfos) {
  return !allIdInfos
    .slice(index + 1)
    .some((idInfosB) => isSameIdInfos(idInfosA, idInfosB))
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
