import { isSameArray } from '../../../../utils/equal.js'
import { findIndexFrom } from '../../../../utils/find.js'

// Find another `dimensions` with the same names and exactly 1 different value.
export const findConcatDimension = (
  firstDimensions,
  dimensionNames,
  secondDimensions,
  secondDimensionNames,
  // eslint-disable-next-line max-params
) => {
  if (!isSameArray(dimensionNames, secondDimensionNames)) {
    return
  }

  const differentDimensionIndexA = findDifferentDimension(
    dimensionNames,
    firstDimensions,
    secondDimensions,
    0,
  )

  if (differentDimensionIndexA === -1) {
    return
  }

  const differentDimensionIndexB = findDifferentDimension(
    dimensionNames,
    firstDimensions,
    secondDimensions,
    differentDimensionIndexA + 1,
  )

  if (differentDimensionIndexB !== -1) {
    return
  }

  return dimensionNames[differentDimensionIndexA]
}

const findDifferentDimension = (
  dimensionNames,
  firstDimensions,
  secondDimensions,
  startIndex,
  // eslint-disable-next-line max-params
) =>
  findIndexFrom(
    dimensionNames,
    (dimensionName) =>
      !isSameArray(
        firstDimensions[dimensionName],
        secondDimensions[dimensionName],
      ),
    startIndex,
  )
