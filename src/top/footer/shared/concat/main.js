import { mapValues } from '../../../../utils/map.js'

import { loopFirstDimensions } from './loop.js'

// A system prop might match two sets of dimensions identical except for one
// dimension. In that case, we merge both.
//  - For example, if a system prop applies to A+Red, B+Green, A+Green, B+Red,
//    we simplify it to A/B+Red/Green
// We do so by iterating through every combination of dimensions
//  - If only one dimension differs, we merge them
//  - We repeat until no more dimension has been merged
export const concatDimensionsValues = function (dimensionsArray) {
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
  const dimensionsA = mapValues(dimensions, normalizeDimension)
  return { dimensionNames, dimensions: dimensionsA }
}

// Dimension values are now array of alternatives
const normalizeDimension = function (dimensionValue) {
  return [dimensionValue]
}

const denormalizeDimensions = function ({ dimensions }) {
  return dimensions
}
