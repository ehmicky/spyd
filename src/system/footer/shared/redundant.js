import omit from 'omit.js'

import { setArray } from '../../../utils/set.js'

// Some dimensions are redundant, i.e. removing them does change which systems
// are matched because either:
//  - The prop is matched by several dimensions in `dimensionsArray`
//  - The systems are missing some dimensions
// For example, if a prop applies to all systems, its `dimensionsArray` will
// list each possible `dimensions`. This logic would reduce it to an empty
// `dimensionArray`.
// We do this by iterating through each dimension, checking if it can be
// removed, then removing it.
export const skipRedundantInfo = function (dimensionsArray, systems) {
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

  const dimensionsA = omit.default(dimensionsArray[index], [dimensionName])
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
