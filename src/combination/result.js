import { getCombinationIds } from './ids/get.js'

// Filter out the `result.combinations` that are not in `combinations`
export const keepResultCombinations = (result, combinations) => {
  const combinationsA = result.combinations.filter((combination) =>
    hasCombination(combinations, combination),
  )
  return { ...result, combinations: combinationsA }
}

// Filter out the `combinationsA` that are in `combinationsB`
export const removeSameCombinations = (combinationsA, combinations) =>
  combinationsA.filter(
    (combination) => !hasCombination(combinations, combination),
  )

// Return whether a result combinations is a subset of another
export const hasSameCombinations = (resultA, resultB) =>
  resultA.combinations.every((combination) =>
    hasCombination(resultB.combinations, combination),
  )

// Return whether a result has a specific combination
const hasCombination = (combinations, combination) =>
  getMatchingCombination(combinations, combination) !== undefined

// Return the same combination with the same identifiers
export const getMatchingCombination = (combinations, combination) =>
  combinations.find((combinationA) =>
    hasSameCombinationIds(combinationA, combination),
  )

// Check if two combinations have same identifiers for all dimensions
export const hasSameCombinationIds = (combinationA, combinationB) => {
  const combinationIdsA = getCombinationIds(combinationA)
  const combinationIdsB = getCombinationIds(combinationB)
  return combinationIdsA.every((combinationId) =>
    combinationIdsB.includes(combinationId),
  )
}
