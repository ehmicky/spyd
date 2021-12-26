import mapObj from 'map-obj'
import omit from 'omit.js'

import { isSameArray } from '../../../utils/equal.js'
import { findIndexFrom } from '../../../utils/find.js'
import { setArray } from '../../../utils/set.js'
import { uniqueDeep } from '../../../utils/unique.js'

// Reduce the amount of system dimensions and properties so the system footer
// looks simpler
export const simplifyPropGroups = function (propGroups, systems) {
  return propGroups.map((propGroup) => simplifyPropGroup(propGroup, systems))
}

const simplifyPropGroup = function ({ propEntries, dimensionsArray }, systems) {
  const dimensionsArrayA = skipRedundantInfo(dimensionsArray, systems)
  const dimensionsArrayB = uniqueDeep(dimensionsArrayA)
  const dimensionsArrayC = normalizeTopSystem(dimensionsArrayB)
  const dimensionsArrayD = concatDimensionsValues(dimensionsArrayC)
  return { propEntries, dimensionsArray: dimensionsArrayD }
}

// Some dimensions are redundant, i.e. removing them does change which systems
// are matched because either:
//  - The prop is matched by several dimensions in `dimensionsArray`
//  - The systems are missing some dimensions
// For example, if a prop applies to all systems, its `dimensionsArray` will
// list each possible `dimensions`. This logic would reduce it to an empty
// `dimensionArray`.
// We do this by iterating through each dimension, checking if it can be
// removed, then removing it.
const skipRedundantInfo = function (dimensionsArray, systems) {
  return dimensionsArray.reduce(
    skipRedundantDimensions.bind(undefined, systems),
    dimensionsArray,
  )
}

// Sometimes, removing dimensions can result in several equivalent but different
// result depending on the order in which dimensions are iterated.
//  - We iterate from the last to the first dimensions, so that the last
//    dimensions are removed instead of the first ones, since the first ones
//    are more likely to be more significant for users.
// eslint-disable-next-line max-params
const skipRedundantDimensions = function (
  systems,
  dimensionsArray,
  dimensions,
  index,
) {
  return Object.keys(dimensions).reduceRight(
    skipRedundantDimension.bind(undefined, { systems, index }),
    dimensionsArray,
  )
}

const skipRedundantDimension = function (
  { systems, index },
  dimensionsArray,
  dimensionName,
) {
  if (
    !isRedundantDimension({ systems, dimensionsArray, dimensionName, index })
  ) {
    return dimensionsArray
  }

  const dimensions = dimensionsArray[index]
  const dimensionsA = omit.default(dimensions, [dimensionName])
  return setArray(dimensionsArray, index, dimensionsA)
}

// Check if removing the dimension would result in a different count of matching
// systems
const isRedundantDimension = function ({
  systems,
  dimensionsArray,
  dimensionName,
  index,
}) {
  const { length } = systems.filter((system) =>
    dimensionsArrayMatches({ system, dimensionsArray, index, dimensionName }),
  )
  return length === dimensionsArray.length
}

const dimensionsArrayMatches = function ({
  system,
  dimensionsArray,
  index,
  dimensionName,
}) {
  return dimensionsArray.some((dimensions, indexB) =>
    dimensionsMatches({
      system,
      dimensions,
      index,
      indexB,
      dimensionName,
    }),
  )
}

const dimensionsMatches = function ({
  system,
  dimensions,
  index,
  indexB,
  dimensionName,
}) {
  return Object.entries(dimensions).every(([dimensionNameB, dimensionValueB]) =>
    dimensionMatches({
      system,
      index,
      indexB,
      dimensionName,
      dimensionNameB,
      dimensionValueB,
    }),
  )
}

const dimensionMatches = function ({
  system,
  index,
  indexB,
  dimensionName,
  dimensionNameB,
  dimensionValueB,
}) {
  return (
    system.dimensions[dimensionNameB] === dimensionValueB ||
    (indexB === index && dimensionNameB === dimensionName)
  )
}

// Properties which apply to all systems result in a `dimensionsArray` with a
// single empty object. We normalize it to an empty array.
const normalizeTopSystem = function (dimensionsArray) {
  return dimensionsArray.filter(isNotEmptyDimensions)
}

const isNotEmptyDimensions = function (dimensions) {
  return Object.keys(dimensions).length !== 0
}

// A system prop might match two sets of dimensions identical except for one
// dimension. In that case, we merge both.
//  - For example, if a system prop applies to A+Red, B+Green, A+Green, B+Red,
//    we simplify it to A/B+Red/Green
// We do so by iterating through every combination of dimensions
//  - If only one dimension differs, we merge them
//  - We repeat until no more dimension has been merged
const concatDimensionsValues = function (dimensionsArray) {
  const dimensionsArrayA = dimensionsArray.map(normalizeDimensions)

  // eslint-disable-next-line fp/no-let
  let dimensionsCount = 0

  // eslint-disable-next-line fp/no-loops
  while (dimensionsCount !== dimensionsArrayA.length) {
    // eslint-disable-next-line fp/no-mutation
    dimensionsCount = dimensionsArrayA.length
    loopFirstDimensions(dimensionsArrayA)
  }

  const dimensionsArrayB = dimensionsArrayA.map(denormalizeDimensions)
  return dimensionsArrayB
}

const normalizeDimensions = function (dimensions) {
  const dimensionNames = Object.keys(dimensions)
  const dimensionsA = mapObj(dimensions, normalizeDimension)
  return { dimensionNames, dimensions: dimensionsA }
}

// Dimension values are now array of alternatives
const normalizeDimension = function (dimensionName, dimensionValue) {
  return [dimensionName, [dimensionValue]]
}

const denormalizeDimensions = function ({ dimensions }) {
  return dimensions
}

const loopFirstDimensions = function (dimensionsArray) {
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

// Find another `dimensions` with the same names and exactly 1 different value.
// eslint-disable-next-line max-params
const findConcatDimension = function (
  firstDimensions,
  dimensionNames,
  secondDimensions,
  secondDimensionNames,
) {
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

// eslint-disable-next-line max-params
const findDifferentDimension = function (
  dimensionNames,
  firstDimensions,
  secondDimensions,
  startIndex,
) {
  return findIndexFrom(
    dimensionNames,
    (dimensionName) =>
      !isSameArray(
        firstDimensions[dimensionName],
        secondDimensions[dimensionName],
      ),
    startIndex,
  )
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
