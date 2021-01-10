import omit from 'omit.js'

import { getCombinationIds } from '../select/ids.js'

// Merge previous results to the last result
export const mergeResults = function (results) {
  // eslint-disable-next-line fp/no-mutating-methods
  const [lastResult, ...resultsA] = results.map(addCombinationKeys).reverse()
  const result = resultsA.reduce(mergePair, lastResult)
  const resultA = removeCombinationKeys(result)
  return resultA
}

// Add stable key describing combinations identity
const addCombinationKeys = function ({ combinations, ...result }) {
  const combinationsA = combinations.map(addCombinationKey)
  return { ...result, combinations: combinationsA }
}

const addCombinationKey = function (combination) {
  const key = getCombinationIds(combination).join(' ')
  return { ...combination, key }
}

const removeCombinationKeys = function ({ combinations, ...result }) {
  const combinationsA = combinations.map(removeCombinationKey)
  return { ...result, combinations: combinationsA }
}

const removeCombinationKey = function (combination) {
  return omit(combination, ['combinationsKey'])
}

const mergePair = function (
  { combinations, ...result },
  { combinations: previousCombinations },
) {
  const combinationsA = addNewCombinations(combinations, previousCombinations)
  return { ...result, combinations: combinationsA }
}

const addNewCombinations = function (combinations, previousCombinations) {
  const newCombinations = previousCombinations.filter((combination) =>
    isNewCombination(combination, combinations),
  )
  return [...combinations, ...newCombinations]
}

const isNewCombination = function (combination, combinations) {
  return !combinations.some((combinationA) =>
    isSameCombination(combination, combinationA),
  )
}

const isSameCombination = function ({ key: keyA }, { key: keyB }) {
  return keyA === keyB
}
