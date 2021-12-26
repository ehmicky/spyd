import { findConcatDimension } from './concat_find.js'

export const loopFirstDimensions = function (dimensionsArray) {
  // eslint-disable-next-line fp/no-loops
  for (
    // eslint-disable-next-line fp/no-let
    let firstIndex = 0;
    firstIndex < dimensionsArray.length - 1;
    // eslint-disable-next-line fp/no-mutation
    firstIndex += 1
  ) {
    const { dimensions: firstDimensions, dimensionNames } =
      dimensionsArray[firstIndex]
    loopSecondDimensions(
      dimensionsArray,
      firstIndex,
      firstDimensions,
      dimensionNames,
    )
  }
}

// eslint-disable-next-line max-params
const loopSecondDimensions = function (
  dimensionsArray,
  firstIndex,
  firstDimensions,
  dimensionNames,
) {
  // eslint-disable-next-line fp/no-loops
  for (
    // eslint-disable-next-line fp/no-let
    let secondIndex = firstIndex + 1;
    secondIndex < dimensionsArray.length;
    // eslint-disable-next-line fp/no-mutation
    secondIndex += 1
  ) {
    const {
      dimensions: secondDimensions,
      dimensionNames: secondDimensionNames,
    } = dimensionsArray[secondIndex]
    const concatDimensionName = findConcatDimension(
      firstDimensions,
      dimensionNames,
      secondDimensions,
      secondDimensionNames,
    )

    // eslint-disable-next-line max-depth
    if (concatDimensionName !== undefined) {
      // eslint-disable-next-line fp/no-mutation
      secondIndex = concatValues(
        dimensionsArray,
        firstDimensions,
        secondDimensions,
        concatDimensionName,
        secondIndex,
      )
    }
  }
}

// Merge the values of two `dimensions`
// eslint-disable-next-line max-params
const concatValues = function (
  dimensionsArray,
  firstDimensions,
  secondDimensions,
  concatDimensionName,
  secondIndex,
) {
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  firstDimensions[concatDimensionName] = [
    ...firstDimensions[concatDimensionName],
    ...secondDimensions[concatDimensionName],
  ]
  // eslint-disable-next-line fp/no-mutating-methods
  dimensionsArray.splice(secondIndex, 1)
  return secondIndex - 1
}
