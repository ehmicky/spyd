import { isSameCategory } from './ids.js'

// Return all combinations in `results`
export const getResultsCombinations = function (results) {
  return results.flatMap(getCombinations)
}

const getCombinations = function ({ combinations }) {
  return combinations
}

// Return whether several results have a specific combination
export const resultsHaveCombinations = function (results, combination) {
  return results.some((result) => resultHasCombination(result, combination))
}

// Return whether a result has a specific combination
export const resultHasCombination = function ({ combinations }, combination) {
  return getMatchingCombination(combinations, combination) !== undefined
}

// Return the same combination with the same identifiers
export const getMatchingCombination = function (combinations, combination) {
  return combinations.find((combinationA) =>
    isSameCategory(combinationA, combination),
  )
}

// Filter out the `combinations` that are in `result`
export const getNewCombinations = function (result, combinations) {
  return combinations.filter(
    (resultCombination) => !resultHasCombination(result, resultCombination),
  )
}
