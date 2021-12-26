import sortOn from 'sort-on'

export const sortDimensionsArray = function (dimensionsArray) {
  // eslint-disable-next-line fp/no-mutating-methods
  return dimensionsArray.map(sortDimensions).sort(compareDimensionsEntries)
}

// Sort each dimension within a given `dimensions` by its dimension name
const sortDimensions = function (dimensions) {
  const dimensionsEntries = Object.entries(dimensions)
  return sortOn(dimensionsEntries, [0])
}

// Sort the `dimensions` in each system's title, when it has several:
//  - Sets with fewer `dimensions` are shown first
//  - Then, we compare the first dimension of each set by name, then value
//  - Then the second dimension, and so on
// eslint-disable-next-line complexity
const compareDimensionsEntries = function (
  dimensionsEntriesA,
  dimensionsEntriesB,
) {
  if (dimensionsEntriesA.length > dimensionsEntriesB.length) {
    return 1
  }

  if (dimensionsEntriesA.length < dimensionsEntriesB.length) {
    return -1
  }

  // eslint-disable-next-line unicorn/no-for-loop, fp/no-loops, fp/no-let, fp/no-mutation
  for (let index = 0; index < dimensionsEntriesA.length; index += 1) {
    const result = compareDimensionsEntry(
      dimensionsEntriesA[index],
      dimensionsEntriesB[index],
    )

    // eslint-disable-next-line max-depth
    if (result !== 0) {
      return result
    }
  }

  return 0
}

// eslint-disable-next-line complexity
const compareDimensionsEntry = function (
  [dimensionNameA, dimensionValueArrayA],
  [dimensionNameB, dimensionValueArrayB],
) {
  if (dimensionNameA > dimensionNameB) {
    return 1
  }

  if (dimensionNameA < dimensionNameB) {
    return -1
  }

  const maxLength = Math.max(
    dimensionValueArrayA.length,
    dimensionValueArrayB.length,
  )

  // eslint-disable-next-line fp/no-loops, fp/no-mutation, fp/no-let
  for (let index = 0; index < maxLength; index += 1) {
    const result = compareDimensionsValue(
      dimensionValueArrayA[index],
      dimensionValueArrayB[index],
    )

    // eslint-disable-next-line max-depth
    if (result !== 0) {
      return result
    }
  }

  return 0
}

const compareDimensionsValue = function (dimensionValueA, dimensionValueB) {
  if (dimensionValueA < dimensionValueB) {
    return -1
  }

  if (dimensionValueA > dimensionValueB) {
    return 1
  }

  return 0
}
