import { getCombinationIds } from './ids/get.js'

// Filter out the `result.combinations` that are not in `combinations`
export const keepResultCombinations = function (result, combinations) {
  const combinationsA = result.combinations.filter((combination) =>
    hasCombination(combinations, combination),
  )
  return { ...result, combinations: combinationsA }
}

// Filter out the `combinationsA` that are in `combinationsB`
export const removeSameCombinations = function (combinationsA, combinations) {
  return combinationsA.filter(
    (combination) => !hasCombination(combinations, combination),
  )
}

// Return whether a result combinations is a subset of another
export const hasSameCombinations = function (resultA, resultB) {
  return resultA.combinations.every((combination) =>
    hasCombination(resultB.combinations, combination),
  )
}

// Return whether a result has a specific combination
const hasCombination = function (combinations, combination) {
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
