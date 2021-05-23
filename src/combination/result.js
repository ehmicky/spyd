import { isSameCategory } from './ids.js'

// Filter out the `resultA.combinations` that are not in `resultB`
export const pickResultCombinations = function (resultA, resultB) {
  const combinations = keepResultCombinations(resultA.combinations, resultB)
  return { ...resultA, combinations }
}

// Filter out the `combinations` that are not in `result`
const keepResultCombinations = function (combinations, result) {
  return combinations.filter((combination) =>
    resultHasCombination(result, combination),
  )
}

// Filter out the `resultA.combinations` that are in `resultB`
export const omitResultCombinations = function (resultA, resultB) {
  const combinations = removeResultCombinations(resultA.combinations, resultB)
  return { ...resultA, combinations }
}

// Filter out the `combinations` that are in `result`
export const removeResultCombinations = function (combinations, result) {
  return combinations.filter(
    (combination) => !resultHasCombination(result, combination),
  )
}

// Return whether several results have a specific combination
export const resultsHaveCombinations = function (results, combination) {
  return results.some((result) => resultHasCombination(result, combination))
}

// Return whether a result has a specific combination
const resultHasCombination = function ({ combinations }, combination) {
  return getMatchingCombination(combinations, combination) !== undefined
}

// Return the same combination with the same identifiers
export const getMatchingCombination = function (combinations, combination) {
  return combinations.find((combinationA) =>
    isSameCategory(combinationA, combination),
  )
}
