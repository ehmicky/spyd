import {
  isSameIdInfos,
  getIdInfos,
  isUniqueCombinationIds,
  isSameCategory,
} from './ids.js'

// Return whether one of several results has a specific combination
export const resultsHaveCombination = function (results, combination) {
  return results.some((result) => resultHasCombination(result, combination))
}

// Return whether a result has a specific combination
export const resultHasCombination = function ({ combinations }, combinationA) {
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
