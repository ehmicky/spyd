import { excludeKeys } from 'filter-obj'

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
export const skipRedundantInfo = (dimensionsArray, systems) =>
  dimensionsArray.reduce(
    skipRedundantDimensions.bind(undefined, systems),
    dimensionsArray,
  )

// eslint-disable-next-line max-params
const skipRedundantDimensions = (systems, dimensionsArray, dimensions, index) =>
  Object.keys(dimensions).reduce(
    skipRedundantDimension.bind(undefined, { systems, index }),
    dimensionsArray,
  )

const skipRedundantDimension = (
  { systems, index },
  dimensionsArray,
  dimensionName,
) => {
  if (
    !isRedundantDimension({ systems, dimensionsArray, dimensionName, index })
  ) {
    return dimensionsArray
  }

  const dimensionsA = excludeKeys(dimensionsArray[index], [dimensionName])
  return setArray(dimensionsArray, index, dimensionsA)
}

// Check if removing the dimension would result in a different count of matching
// systems
const isRedundantDimension = ({
  systems,
  dimensionsArray,
  dimensionName,
  index,
}) => {
  const { length } = systems.filter((system) =>
    dimensionsArrayMatches({ system, dimensionsArray, index, dimensionName }),
  )
  return length === dimensionsArray.length
}

const dimensionsArrayMatches = ({
  system,
  dimensionsArray,
  index,
  dimensionName,
}) =>
  dimensionsArray.some((dimensions, indexB) =>
    dimensionsMatches({
      system,
      dimensions,
      index,
      indexB,
      dimensionName,
    }),
  )

const dimensionsMatches = ({
  system,
  dimensions,
  index,
  indexB,
  dimensionName,
}) =>
  Object.entries(dimensions).every(([dimensionNameB, dimensionValueB]) =>
    dimensionMatches({
      system,
      index,
      indexB,
      dimensionName,
      dimensionNameB,
      dimensionValueB,
    }),
  )

const dimensionMatches = ({
  system,
  index,
  indexB,
  dimensionName,
  dimensionNameB,
  dimensionValueB,
}) =>
  system.dimensions[dimensionNameB] === dimensionValueB ||
  (indexB === index && dimensionNameB === dimensionName)
