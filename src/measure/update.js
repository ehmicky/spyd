// Update a `combination` inside the array of `combinations`
export const updateCombinations = function (combinations, newCombination) {
  return combinations.map((combination) =>
    updateCombination(combination, newCombination),
  )
}

const updateCombination = function (combination, newCombination) {
  return combination.id === newCombination.id ? newCombination : combination
}
