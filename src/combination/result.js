import { getCombinationIds } from './ids/get.js'

// Filter out the `combinations` that are not in `result`
export const keepResultCombinations = function (resultA, resultB) {
  const combinations = resultA.combinations.filter((combination) =>
    resultHasCombination(resultB, combination),
  )
  return { ...resultA, combinations }
}

// Filter out the `combinations` that are in `result`
export const removeResultCombinations = function (combinations, result) {
  return combinations.filter(
    (combination) => !resultHasCombination(result, combination),
  )
}

// Return whether a result combinations is a subset of another
export const hasSameCombinations = function ({ combinations }, result) {
  return combinations.every((combination) =>
    resultHasCombination(result, combination),
  )
}

// Return whether a result has a specific combination
const resultHasCombination = function ({ combinations }, combination) {
  return getMatchingCombination(combinations, combination) !== undefined
}

// Return the same combination with the same identifiers
export const getMatchingCombination = function (combinations, combination) {
  return combinations.find((combinationA) =>
    hasSameCombinationIds(combinationA, combination),
  )
}

// Check if two combinations have same identifiers for all dimensions
export const hasSameCombinationIds = function (combinationA, combinationB) {
  const combinationIdsA = getCombinationIds(combinationA)
  const combinationIdsB = getCombinationIds(combinationB)
  return combinationIdsA.every((combinationId) =>
    combinationIdsB.includes(combinationId),
  )
}
