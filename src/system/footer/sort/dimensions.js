import sortOn from 'sort-on'

export const sortDimensionsArray = function (dimensionsArray, dimensionNames) {
  // eslint-disable-next-line fp/no-mutating-methods
  return dimensionsArray
    .map(sortDimensionsEntries.bind(undefined, dimensionNames))
    .sort(compareDimensionsEntries)
}

// Sort each dimension within a given `dimensions` by its dimension name.
// Then sort each dimension value's array item.
const sortDimensionsEntries = function (dimensionNames, dimensionsEntries) {
  const dimensionsEntriesA = dimensionsEntries.map((dimensionsEntry) =>
    addDimensionNameOrder(dimensionsEntry, dimensionNames),
  )
  const dimensionsEntriesB = sortOn(dimensionsEntriesA, ['2'])
  return dimensionsEntriesB.map(sortDimensionValueArray)
}

const addDimensionNameOrder = function (
  [dimensionName, dimensionValueArray],
  dimensionNames,
) {
  const dimensionNameIndex = dimensionNames.indexOf(dimensionName)
  const dimensionNameOrder =
    dimensionNameIndex === -1 ? Number.POSITIVE_INFINITY : dimensionNameIndex
  return [dimensionName, dimensionValueArray, dimensionNameOrder]
}

const sortDimensionValueArray = function ([
  dimensionName,
  dimensionValueArray,
  dimensionNameOrder,
]) {
  // eslint-disable-next-line fp/no-mutating-methods
  return [dimensionName, [...dimensionValueArray].sort(), dimensionNameOrder]
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
  [, dimensionValueArrayA, dimensionNameOrderA],
  [, dimensionValueArrayB, dimensionNameOrderB],
) {
  if (dimensionNameOrderA > dimensionNameOrderB) {
    return 1
  }

  if (dimensionNameOrderA < dimensionNameOrderB) {
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

// `dimensionValueA|B` might be `undefined`, but this logic still works
const compareDimensionsValue = function (dimensionValueA, dimensionValueB) {
  if (dimensionValueA < dimensionValueB) {
    return -1
  }

  if (dimensionValueA > dimensionValueB) {
    return 1
  }

  return 0
}
