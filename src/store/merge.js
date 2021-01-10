// Merge previous results to the last result
export const mergeResults = function (results) {
  // eslint-disable-next-line fp/no-mutating-methods
  const [lastResult, ...resultsA] = [...results].reverse()
  const result = resultsA.reduce(mergePair, lastResult)
  return result
}

// We keep the last result: id, timestamp
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
