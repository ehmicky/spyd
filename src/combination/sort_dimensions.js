import { findDimensionIndex } from './dimensions.js'

// Dimensions order is significant as it defines:
//  - The sorting order of combinations in reporters
//  - The order of dimensions when printed
// The order follows:
//  - `DIMENSIONS` order
//  - For dynamic dimensions, property order by lexicographic order
//     - We do not use the configuration property order because it is too hard
//       to implement
// For most of the logic, we rely on using this file's methods which return
// dimensions sorted.
// However, reporters are external, so we sort `combination.dimensions` on their
// behalf.
//  - This is used for example for combination titles in reporters
export const sortDimensions = (result) => {
  const combinations = result.combinations.map(sortCombDimensions)
  return { ...result, combinations }
}

const sortCombDimensions = (combination) => {
  const { dimensions } = combination
  // eslint-disable-next-line fp/no-mutating-methods
  const dimensionNames = Object.keys(dimensions).sort(compareDimensionNames)
  const dimensionsA = Object.fromEntries(
    dimensionNames.map((dimensionName) => [
      dimensionName,
      dimensions[dimensionName],
    ]),
  )
  return { ...combination, dimensions: dimensionsA }
}

// eslint-disable-next-line complexity, max-statements
const compareDimensionNames = (dimensionNameA, dimensionNameB) => {
  const indexA = findDimensionIndex(dimensionNameA)
  const indexB = findDimensionIndex(dimensionNameB)

  if (indexA < indexB) {
    return -1
  }

  if (indexA > indexB) {
    return 1
  }

  if (dimensionNameA < dimensionNameB) {
    return -1
  }

  if (dimensionNameA > dimensionNameB) {
    return 1
  }

  return 0
}
